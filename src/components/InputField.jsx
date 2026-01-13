const InputField = ({ label, type = "text", value, onChange, placeholder }) => {
  return (
    <div className="input-group">
      <label>{label}</label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      )}
    </div>
  );
};

export default InputField;
