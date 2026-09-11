import React, { useCallback, useEffect, useState } from "react";
import {
  X,
  Search,
  RefreshCw,
  CheckCircle2,
  Upload,
  Trash2,
} from "lucide-react";
import {
  createReceptionSession,
  createVehicleInspection,
  getVehicles,
  uploadInspectionPhoto,
} from "../../api/receptionApi";
import "./css/ReceptionDashboard.css";
import "./css/ReceptionVehicleModal.css";
import "./css/CheckInVehicleModal.css";
import { Car, ParkingSquare } from "lucide-react";

const generateTicketCode = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `TKT-${num}`;
};

// Backend allows a maximum of 10 MB per image.
const MAX_PHOTO_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const ALLOWED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
];

const createInspectionPhoto = (file) => ({
  file,
  previewUrl: URL.createObjectURL(file),
});

const CheckInVehicleModal = ({
  onClose,
  onSuccess,
  preselectedVehicle = null,
}) => {
  const [vehicleSearch, setVehicleSearch] = useState(
    preselectedVehicle?.license_plate || ""
  );

  const [vehicleId, setVehicleId] = useState(
    preselectedVehicle?.id || ""
  );

  const [selectedVehicle, setSelectedVehicle] = useState(
    preselectedVehicle || null
  );

  const [vehicles, setVehicles] = useState(
    preselectedVehicle ? [preselectedVehicle] : []
  );

  const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  const [parkingType, setParkingType] = useState("valet");
  const [ticketCode, setTicketCode] = useState(generateTicketCode());

  const [loading, setLoading] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  // Inspection state
  const [conditionStatus, setConditionStatus] = useState("good");
  const [damageDescription, setDamageDescription] = useState("");
  const [inspectionNotes, setInspectionNotes] = useState("");

  // Each item:
  // {
  //   file: File,
  //   previewUrl: string
  // }
  const [inspectionPhotos, setInspectionPhotos] = useState([]);

  const searchVehicles = useCallback(async (q) => {
    try {
      setLoadingVehicles(true);

      const res = await getVehicles(q);

      if (res && res.success) {
        setVehicles(res.vehicles || []);
        setVehicleDropdownOpen(true);
      }
    } catch (err) {
      console.warn("Search vehicles error:", err);
    } finally {
      setLoadingVehicles(false);
    }
  }, []);

  useEffect(() => {
    if (!preselectedVehicle) {
      searchVehicles("");
    }
  }, [preselectedVehicle, searchVehicles]);

  /*
   * Clean up object URLs when the modal is unmounted.
   */
  useEffect(() => {
    return () => {
      inspectionPhotos.forEach(({ previewUrl }) => {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
      });
    };
  }, [inspectionPhotos]);

  const handleVehicleSearch = (e) => {
    const q = e.target.value;

    setVehicleSearch(q);
    setVehicleId("");
    setSelectedVehicle(null);

    searchVehicles(q);
  };

  const selectVehicle = (v) => {
    setVehicleId(v.id);
    setSelectedVehicle(v);
    setVehicleSearch(v.license_plate);
    setVehicleDropdownOpen(false);
  };

  /*
   * Validate inspection image before adding it to the selection.
   */
  const validateInspectionPhoto = (file) => {
    const extension = `.${file.name
      .split(".")
      .pop()
      ?.toLowerCase()}`;

    const validMimeType = ALLOWED_IMAGE_TYPES.includes(file.type);
    const validExtension =
      ALLOWED_IMAGE_EXTENSIONS.includes(extension);

    if (!validMimeType || !validExtension) {
      return `${file.name}: Only JPEG, PNG and WebP images are allowed.`;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      return `${file.name}: Image size must be 10 MB or smaller.`;
    }

    if (file.size === 0) {
      return `${file.name}: The selected file is empty.`;
    }

    return null;
  };

  /*
   * Prevent selecting the same physical file more than once.
   */
  const isDuplicatePhoto = (file, currentPhotos) => {
    return currentPhotos.some(
      ({ file: existingFile }) =>
        existingFile.name === file.name &&
        existingFile.size === file.size &&
        existingFile.lastModified === file.lastModified
    );
  };

  /*
   * Handle multiple inspection photo selection.
   */
  const handleInspectionPhotoChange = (event) => {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (selectedFiles.length === 0) {
      return;
    }

    const validFiles = [];
    const validationErrors = [];

    selectedFiles.forEach((file) => {
      const validationError = validateInspectionPhoto(file);

      if (validationError) {
        validationErrors.push(validationError);
        return;
      }

      if (isDuplicatePhoto(file, inspectionPhotos)) {
        validationErrors.push(
          `${file.name}: This photo is already selected.`
        );
        return;
      }

      validFiles.push(file);
    });

    if (validationErrors.length > 0) {
      setError(validationErrors.join(" "));
    } else {
      setError("");
    }

    if (validFiles.length > 0) {
      setInspectionPhotos((current) => [
        ...current,
        ...validFiles.map(createInspectionPhoto),
      ]);
    }

    // Allows selecting the same file again after removing it.
    event.target.value = "";
  };

  /*
   * Remove a selected photo before check-in.
   */
  const removeInspectionPhoto = (indexToRemove) => {
    setInspectionPhotos((current) => {
      const photoToRemove = current[indexToRemove];

      if (photoToRemove?.previewUrl) {
        URL.revokeObjectURL(photoToRemove.previewUrl);
      }

      return current.filter(
        (_, index) => index !== indexToRemove
      );
    });
  };

  /*
   * Reset inspection fields and release preview URLs.
   */
  const resetInspection = () => {
    setInspectionPhotos((current) => {
      current.forEach(({ previewUrl }) => {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
      });

      return [];
    });

    setConditionStatus("good");
    setDamageDescription("");
    setInspectionNotes("");
  };

  /*
   * Submit check-in + inspection + inspection photos.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!vehicleId) {
      setError("Please select a vehicle to check in.");
      return;
    }

    if (!ticketCode.trim()) {
      setError("Ticket code is required.");
      return;
    }

    if (
      conditionStatus === "damaged" &&
      !damageDescription.trim()
    ) {
      setError("Please describe the visible damage.");
      return;
    }

    try {
      setLoading(true);

      /*
       * 1. Create parking session.
       */
      const res = await createReceptionSession({
        vehicle_id: vehicleId,
        parking_type: parkingType,
        ticket_code: ticketCode.trim().toUpperCase(),
      });

      if (!res || !res.success || !res.session?.id) {
        throw new Error(
          res?.message || "Failed to check in vehicle."
        );
      }

      /*
       * 2. Create vehicle inspection.
       *
       * The backend automatically uses the logged-in
       * authenticated user as inspected_by.
       */
      const inspectionResponse =
        await createVehicleInspection({
          session_id: res.session.id,
          vehicle_id: vehicleId,
          condition_status: conditionStatus,
          damage_description:
            damageDescription.trim() || undefined,
          inspection_notes:
            inspectionNotes.trim() || undefined,
        });

      if (
        !inspectionResponse ||
        !inspectionResponse.success ||
        !inspectionResponse.inspection?.id
      ) {
        throw new Error(
          inspectionResponse?.message ||
            "Vehicle was checked in, but inspection could not be recorded."
        );
      }

      /*
       * 3. Upload inspection photos.
       */
      if (inspectionPhotos.length > 0) {
        setUploadingPhotos(true);

        const uploadResults = await Promise.allSettled(
          inspectionPhotos.map(({ file }) =>
            uploadInspectionPhoto(
              inspectionResponse.inspection.id,
              file
            )
          )
        );

        const failedUploads = uploadResults.filter(
          (result) => result.status === "rejected"
        );

        setUploadingPhotos(false);

        if (failedUploads.length > 0) {
          throw new Error(
            `${failedUploads.length} inspection photo${
              failedUploads.length > 1 ? "s" : ""
            } could not be uploaded. The session and inspection were created, but please verify the inspection photos.`
          );
        }
      }

      /*
       * 4. Show success state.
       */
      setCreated(res.session);

      if (onSuccess) {
        onSuccess(res.session);
      }
    } catch (err) {
      console.error("Check-in error:", err);

      setError(
        err?.message ||
          "An error occurred while checking in the vehicle."
      );
    } finally {
      setUploadingPhotos(false);
      setLoading(false);
    }
  };

  /*
   * Start another check-in.
   */
  const handleCheckInAnother = () => {
    setCreated(null);

    setVehicleSearch("");
    setVehicleId("");
    setSelectedVehicle(null);

    setTicketCode(generateTicketCode());

    resetInspection();

    setError("");
  };

  return (
    <div
      className="reception-modal-overlay"
      onClick={onClose}
    >
      <div
        className="reception-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="reception-modal-header">
          <div>
            <p className="modal-eyebrow">
              VEHICLE CHECK-IN
            </p>

            <h3>Check-In Vehicle</h3>

            <span>
              Create a new parking session
            </span>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={loading}
          >
            <X size={18} />
          </button>
        </div>

        {/* SUCCESS STATE */}
        {created ? (
          <div className="modal-success-body">
            <div className="modal-success-icon">
              <CheckCircle2 size={40} />
            </div>

            <h4>Vehicle Checked In!</h4>

            <p>
              A parking session and vehicle inspection
              have been recorded successfully.
            </p>

            <div className="modal-id-badge">
              <span>TICKET CODE</span>

              <strong>
                {created.ticket_code}
              </strong>
            </div>

            <div className="modal-success-info">
              <div>
                <span>Vehicle</span>

                <strong>
                  {selectedVehicle?.license_plate || "—"}
                </strong>
              </div>

              <div>
                <span>Parking Type</span>

                <strong
                  style={{
                    textTransform: "capitalize",
                  }}
                >
                  {created.parking_type}
                </strong>
              </div>

              <div>
                <span>Status</span>

                <strong
                  style={{
                    color: "#047857",
                  }}
                >
                  Checked In
                </strong>
              </div>

              <div>
                <span>Inspection</span>

                <strong
                  style={{
                    textTransform: "capitalize",
                  }}
                >
                  {conditionStatus}
                </strong>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="modal-btn-secondary"
                onClick={onClose}
              >
                Done
              </button>

              <button
                className="modal-btn-primary"
                onClick={handleCheckInAnother}
              >
                Check-In Another
              </button>
            </div>
          </div>
        ) : (
          /* CHECK-IN FORM */
          <form
            onSubmit={handleSubmit}
            className="modal-form-body"
          >
            {error && (
              <div className="modal-error">
                {error}
              </div>
            )}

            {/* VEHICLE */}
            <div className="modal-field">
              <label>
                Vehicle{" "}
                <span className="required">*</span>
              </label>

              <div
                style={{
                  position: "relative",
                }}
              >
                <div className="modal-input-wrap">
                  <Search size={15} />

                  <input
                    value={vehicleSearch}
                    onChange={handleVehicleSearch}
                    onFocus={() =>
                      setVehicleDropdownOpen(true)
                    }
                    placeholder="Search by license plate, make, or model..."
                    disabled={loading}
                  />
                </div>

                {vehicleDropdownOpen &&
                  vehicles.length > 0 && (
                    <div className="modal-dropdown">
                      {vehicles.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          className="modal-dropdown-item"
                          onClick={() =>
                            selectVehicle(v)
                          }
                          disabled={loading}
                        >
                          <strong>
                            {v.license_plate}
                          </strong>

                          <span>
                            {v.make} {v.model} •{" "}
                            {v.customer?.name || "—"}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                {vehicleDropdownOpen &&
                  !loadingVehicles &&
                  vehicles.length === 0 && (
                    <div className="modal-dropdown">
                      <div className="modal-dropdown-empty">
                        No vehicles found. Register a
                        vehicle first.
                      </div>
                    </div>
                  )}
              </div>

              {selectedVehicle && (
                <div className="modal-selected-vehicle">
                  <strong>
                    {selectedVehicle.license_plate}
                  </strong>{" "}
                  — {selectedVehicle.make}{" "}
                  {selectedVehicle.model}
                  {selectedVehicle.color &&
                    ` (${selectedVehicle.color})`}
                  {selectedVehicle.customer &&
                    ` · ${selectedVehicle.customer.name}`}
                </div>
              )}
            </div>

            {/* PARKING TYPE */}
            <div className="modal-field">
              <label>
                Parking Type{" "}
                <span className="required">*</span>
              </label>

              <div className="parking-type-toggle">
                <button
                  type="button"
                  className={`type-btn ${
                    parkingType === "valet"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setParkingType("valet")
                  }
                  disabled={loading}
                >
                  <Car />
                  Valet
                </button>

                <button
                  type="button"
                  className={`type-btn ${
                    parkingType === "self"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setParkingType("self")
                  }
                  disabled={loading}
                >
                  <ParkingSquare />
                  Self Park
                </button>
              </div>
            </div>

            {/* TICKET CODE */}
            <div className="modal-field">
              <label>
                Ticket Code{" "}
                <span className="required">*</span>
              </label>

              <div className="modal-input-wrap">
                <input
                  value={ticketCode}
                  onChange={(e) =>
                    setTicketCode(
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="e.g. TKT-1234"
                  disabled={loading}
                  style={{
                    textTransform: "uppercase",
                    fontFamily: "monospace",
                    fontWeight: "700",
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setTicketCode(
                      generateTicketCode()
                    )
                  }
                  title="Generate new ticket code"
                  disabled={loading}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: loading
                      ? "not-allowed"
                      : "pointer",
                    color: "#5e3573",
                    padding: "0 4px",
                  }}
                >
                  <RefreshCw size={15} />
                </button>
              </div>

              <small
                style={{
                  color: "#7b7389",
                  fontSize: "11px",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                Auto-generated. You can edit manually
                if needed.
              </small>
            </div>

            {/* VEHICLE INSPECTION */}
            <div className="modal-field inspection-fields">
              <label>
                Vehicle Inspection{" "}
                <span className="required">*</span>
              </label>

              {/* CONDITION */}
              <div className="inspection-condition-toggle">
                <button
                  type="button"
                  className={`type-btn ${
                    conditionStatus === "good"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setConditionStatus("good")
                  }
                  disabled={loading}
                >
                  Good
                </button>

                <button
                  type="button"
                  className={`type-btn ${
                    conditionStatus === "damaged"
                      ? "active damaged"
                      : ""
                  }`}
                  onClick={() =>
                    setConditionStatus("damaged")
                  }
                  disabled={loading}
                >
                  Damaged
                </button>
              </div>

              {/* DAMAGE DESCRIPTION */}
              {conditionStatus === "damaged" && (
                <textarea
                  value={damageDescription}
                  onChange={(event) =>
                    setDamageDescription(
                      event.target.value
                    )
                  }
                  placeholder="Describe visible damage..."
                  disabled={loading}
                  required
                />
              )}

              {/* INSPECTION NOTES */}
              <textarea
                value={inspectionNotes}
                onChange={(event) =>
                  setInspectionNotes(
                    event.target.value
                  )
                }
                placeholder="Inspection notes (optional)"
                disabled={loading}
              />

              {/* PHOTO UPLOAD */}
              <div className="inspection-upload-wrapper">
                <label className="inspection-upload-label">
                  <Upload size={16} />

                  <span>
                    Upload vehicle photos
                  </span>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={
                      handleInspectionPhotoChange
                    }
                    disabled={loading}
                  />
                </label>

                <small className="inspection-upload-help">
                  JPEG, PNG or WebP • Maximum 10 MB per
                  image • Multiple photos allowed
                </small>
              </div>

              {/* PHOTO PREVIEWS */}
              {inspectionPhotos.length > 0 && (
                <div className="inspection-photo-previews">
                  {inspectionPhotos.map(
                    ({ file, previewUrl }, index) => (
                      <div
                        className="inspection-photo-preview"
                        key={`${file.name}-${file.lastModified}-${index}`}
                      >
                        <img
                          src={previewUrl}
                          alt={`Inspection preview ${
                            index + 1
                          }`}
                        />

                        <div className="inspection-photo-info">
                          <span title={file.name}>
                            {file.name}
                          </span>

                          <small>
                            {(
                              file.size /
                              (1024 * 1024)
                            ).toFixed(2)}{" "}
                            MB
                          </small>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeInspectionPhoto(
                              index
                            )
                          }
                          disabled={loading}
                          title="Remove photo"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* PHOTO COUNT */}
              {inspectionPhotos.length > 0 && (
                <small className="inspection-photo-count">
                  {inspectionPhotos.length} photo
                  {inspectionPhotos.length !== 1
                    ? "s"
                    : ""}{" "}
                  selected
                </small>
              )}
            </div>

            {/* FOOTER */}
            <div className="modal-footer">
              <button
                type="button"
                className="modal-btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="modal-btn-primary"
                disabled={
                  loading || uploadingPhotos
                }
              >
                {uploadingPhotos
                  ? "Uploading Photos..."
                  : loading
                  ? "Checking In..."
                  : "Confirm Check-In"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckInVehicleModal;