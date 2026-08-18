import "./StatCard.css";

function StatCard({
  icon,
  title,
  value,
  description,
  warning = false,
  revenue = false
}) {

  const icons = {
    staff: "♙",
    active: "●",
    customers: "♧",
    parking: "⌖",
    incident: "!",
    revenue: "₹"
  };

  return (
    <div className={`stat-card ${warning ? "warning" : ""}`}>

      <div className="stat-card-top">

        <div className={`stat-icon ${icon}`}>
          {icons[icon]}
        </div>

        <button className="stat-menu">
          •••
        </button>

      </div>


      <div className="stat-card-body">

        <span className="stat-title">
          {title}
        </span>

        <strong className={revenue ? "revenue-value" : ""}>
          {value}
        </strong>

        <p>
          {description}
        </p>

      </div>

    </div>
  );
}

export default StatCard;