const steps = ["Contacts", "Experience", "Education", "Skills", "Finalize"];

function BuilderStepper({ activeStep, onStepChange }) {
  return (
    <div className="builder-stepper">
      {steps.map((step, index) => (
        <button
          key={step}
          className={`builder-step${activeStep === index ? " active" : ""}${index < activeStep ? " completed" : ""}`}
          onClick={() => onStepChange(index)}
          type="button"
        >
          <span>{step}</span>
          <i></i>
        </button>
      ))}
    </div>
  );
}

export default BuilderStepper;
