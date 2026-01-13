import { useState } from "react";
import FormHeader from "../components/FormHeader";
import Section from "../components/Section";
import InputField from "../components/InputField";

const ApplicationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mindset: "",
    failure: "",
    skills: "",
    learning: "",
  });

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Data:", formData);
    alert("Application submitted successfully!");
  };

  return (
    <div className="container">
      <FormHeader />

      <form onSubmit={handleSubmit}>
        {/* General Information */}
        <Section title="General Information">
          <InputField
            label="Full Name"
            value={formData.name}
            onChange={handleChange("name")}
            placeholder="Your full name"
          />
          <InputField
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleChange("email")}
            placeholder="you@example.com"
          />
        </Section>

        {/* Character */}
        <Section title="Character">
          <InputField
            label="What drives you to build things?"
            type="textarea"
            value={formData.mindset}
            onChange={handleChange("mindset")}
            placeholder="Be honest. Be human."
          />
          <InputField
            label="Describe a failure that changed you"
            type="textarea"
            value={formData.failure}
            onChange={handleChange("failure")}
          />
        </Section>

        {/* Competence */}
        <Section title="Competence">
          <InputField
            label="Your strongest technical skill"
            value={formData.skills}
            onChange={handleChange("skills")}
          />
          <InputField
            label="How do you usually learn something new?"
            type="textarea"
            value={formData.learning}
            onChange={handleChange("learning")}
          />
        </Section>

        <button type="submit" className="submit-btn">
          Submit Application
        </button>
      </form>
    </div>
  );
};

export default ApplicationForm;
