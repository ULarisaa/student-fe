import React from "react";

const TestRulesModal = ({ open, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1300,
      }}
    >
      <div
        className="modal"
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "20px",
          maxWidth: "400px",
          width: "90%",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        }}
      >
        <h2>⚠️ Test Rules & Agreement</h2>
        <ul>
          <li>Exiting fullscreen mode at any point will <strong>auto-submit</strong> your test.</li>
          <li>Leaving the screen is <strong>prohibited</strong> and will auto-submit your test.</li>
          <li><strong>Copying or pasting</strong> is not allowed and any attempt will be logged.</li>
          <li>You only have <strong>one attempt</strong>.</li>
        </ul>
        <p>
          By clicking <strong>Start Test</strong>, you confirm that you understand and agree to these conditions,
          and you give permission for the test to be taken in <strong>fullscreen mode</strong>.
        </p>
        <div
          className="modal-actions"
          style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
        >
          <button
            onClick={onConfirm}
            style={{
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Start Test
          </button>
          <button
            onClick={onCancel}
            style={{
              backgroundColor: "#e0e0e0",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestRulesModal;
