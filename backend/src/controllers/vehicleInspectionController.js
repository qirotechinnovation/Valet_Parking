const supabase = require("../config/supabase");

const createVehicleInspection = async (req, res) => {
  try {
    const {
      session_id,
      vehicle_id,
      condition_status,
      damage_description,
      inspection_notes
    } = req.body;

    if (!session_id || !vehicle_id || !condition_status) {
      return res.status(400).json({
        success: false,
        message: "Session ID, vehicle ID and condition status are required."
      });
    }

    if (!["good", "damaged"].includes(condition_status)) {
      return res.status(400).json({
        success: false,
        message: "Condition status must be good or damaged."
      });
    }

    const { data: session, error: sessionError } = await supabase
      .from("parking_sessions")
      .select("id, vehicle_id")
      .eq("id", session_id)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        success: false,
        message: "Parking session not found."
      });
    }

    if (session.vehicle_id !== vehicle_id) {
      return res.status(400).json({
        success: false,
        message: "Vehicle does not belong to this parking session."
      });
    }

    const { data: existingInspection } = await supabase
      .from("vehicle_inspections")
      .select("id")
      .eq("session_id", session_id)
      .maybeSingle();

    if (existingInspection) {
      return res.status(409).json({
        success: false,
        message: "Inspection already exists for this parking session."
      });
    }

    const { data: inspection, error } = await supabase
      .from("vehicle_inspections")
      .insert([
        {
          session_id,
          vehicle_id,
          condition_status,
          damage_description: damage_description || null,
          inspection_notes: inspection_notes || null,
          inspected_by: req.user.id
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(201).json({
      success: true,
      message: "Vehicle inspection recorded successfully.",
      inspection
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};

const getInspectionBySession = async (req, res) => {
  try {
    const { session_id } = req.params;

    const { data: inspection, error } = await supabase
      .from("vehicle_inspections")
      .select(`
        id,
        session_id,
        vehicle_id,
        condition_status,
        damage_description,
        inspection_notes,
        inspected_by,
        inspected_at,
        users (
          id,
          name,
          email,
          role
        )
      `)
      .eq("session_id", session_id)
      .maybeSingle();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: "Inspection not found."
      });
    }

    return res.status(200).json({
      success: true,
      inspection
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};
const uploadInspectionPhoto = async (req, res) => {
  try {
    const { inspection_id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Inspection photo is required."
      });
    }

    const { data: inspection, error: inspectionError } = await supabase
      .from("vehicle_inspections")
      .select("id, session_id, vehicle_id")
      .eq("id", inspection_id)
      .single();

    if (inspectionError || !inspection) {
      return res.status(404).json({
        success: false,
        message: "Vehicle inspection not found."
      });
    }

    const fileExtension = req.file.originalname.split(".").pop().toLowerCase();
    const fileName = `${inspection_id}/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("vehicle-inspection-photos")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error("Inspection photo upload error:", uploadError);

      return res.status(400).json({
        success: false,
        message: uploadError.message
      });
    }

    const { data: photo, error: photoError } = await supabase
      .from("vehicle_inspection_photos")
      .insert([
        {
          inspection_id,
          photo_path: fileName,
          uploaded_by: req.user.id
        }
      ])
      .select()
      .single();

    
      if (photoError) {
  console.error("PHOTO INSERT ERROR:", photoError);
      await supabase.storage
        .from("vehicle-inspection-photos")
        .remove([fileName]);

      return res.status(400).json({
        success: false,
        message: photoError.message
      });
    }

    return res.status(201).json({
      success: true,
      message: "Inspection photo uploaded successfully.",
      photo
    });
  } catch (error) {
    console.error("Upload inspection photo error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};
const getInspectionPhotos = async (req, res) => {
  try {
    const { inspection_id } = req.params;

    const { data: photos, error } = await supabase
      .from("vehicle_inspection_photos")
      .select(`
        id,
        inspection_id,
        photo_path,
        uploaded_by,
        uploaded_at
      `)
      .eq("inspection_id", inspection_id)
      .order("uploaded_at", { ascending: true });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    const photosWithUrls = await Promise.all(
      (photos || []).map(async (photo) => {
        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from("vehicle-inspection-photos")
            .createSignedUrl(photo.photo_path, 3600);

        return {
          ...photo,
          photo_url: signedUrlError ? null : signedUrlData.signedUrl
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: photosWithUrls.length,
      photos: photosWithUrls
    });
  } catch (error) {
    console.error("Get inspection photos error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};
const deleteInspectionPhoto = async (req, res) => {
  try {
    const { photo_id } = req.params;

    const { data: photo, error: photoError } = await supabase
      .from("vehicle_inspection_photos")
      .select("id, photo_path")
      .eq("id", photo_id)
      .single();

    if (photoError || !photo) {
      return res.status(404).json({
        success: false,
        message: "Inspection photo not found."
      });
    }

    const { error: storageError } = await supabase.storage
      .from("vehicle-inspection-photos")
      .remove([photo.photo_path]);

    if (storageError) {
      return res.status(400).json({
        success: false,
        message: storageError.message
      });
    }

    const { error: deleteError } = await supabase
      .from("vehicle_inspection_photos")
      .delete()
      .eq("id", photo_id);

    if (deleteError) {
      return res.status(400).json({
        success: false,
        message: deleteError.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Inspection photo deleted successfully."
    });
  } catch (error) {
    console.error("Delete inspection photo error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};
const getVehicleInspectionHistory = async (req, res) => {
  try {
    const { vehicle_id } = req.params;

    const { data: inspections, error } = await supabase
      .from("vehicle_inspections")
      .select(`
        id,
        session_id,
        vehicle_id,
        condition_status,
        damage_description,
        inspection_notes,
        inspected_by,
        inspected_at,
        users (
          id,
          name,
          email,
          role
        )
      `)
      .eq("vehicle_id", vehicle_id)
      .order("inspected_at", { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(200).json({
      success: true,
      count: inspections?.length || 0,
      inspections: inspections || []
    });
  } catch (error) {
    console.error("Get vehicle inspection history error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};

module.exports = {
  createVehicleInspection,
  getInspectionBySession,
  uploadInspectionPhoto,
  getInspectionPhotos,
  deleteInspectionPhoto,
  getVehicleInspectionHistory
};