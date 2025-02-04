import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TestComponent = () => {
  const [logStatus, setLogStatus] = useState<string>("");
  const [isDownloadEnabled, setIsDownloadEnabled] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  // Mock data for testing
  const material = "Ethanol";
  const casNumber = "64-17-5";
  const smiles = "CCO";

  // Mock API responses
  const mockCurrentJobResponse = {
    current_job: {
      function_name: "AddMolecule",
      data: {
        compoundName: material,
        cas: casNumber,
        smiles: smiles,
      },
    },
  };

  const mockJobLogsResponse = {
    logs: [
      {
        task: "AddMolecule",
        stdout: `
C:\\ADF_DATA\\Darren>bash -c "$AMSBIN/amspython CreateMolecule.py 'Ethanol' 'CCO' --CAS='64-17-5'"
PLAMS working folder: C:\\ADF_DATA\\Darren\\plams_workdir.018
[29.01|00:54:20] JOB Ethanol STARTED
[29.01|00:54:20] JOB Ethanol RUNNING
[29.01|00:54:20] JOB Ethanol/preoptimization STARTED
[29.01|00:54:20] JOB Ethanol/preoptimization RUNNING
[29.01|00:54:21] JOB Ethanol/preoptimization FINISHED
[29.01|00:54:21] JOB Ethanol/preoptimization SUCCESSFUL
[29.01|00:54:21] JOB Ethanol/gas STARTED
[29.01|00:54:21] JOB Ethanol/gas RUNNING
[29.01|00:54:57] JOB Ethanol/gas FINISHED
[29.01|00:54:57] JOB Ethanol/gas SUCCESSFUL
[29.01|00:54:57] JOB Ethanol/solv STARTED
[29.01|00:54:57] JOB Ethanol/solv RUNNING
[29.01|00:55:07] JOB Ethanol/solv FINISHED
[29.01|00:55:07] JOB Ethanol/solv SUCCESSFUL
[29.01|00:55:07] JOB Ethanol/sigma STARTED
[29.01|00:55:07] JOB Ethanol/sigma RUNNING
[29.01|00:55:08] JOB Ethanol/sigma FINISHED
[29.01|00:55:08] JOB Ethanol/sigma SUCCESSFUL
[29.01|00:55:08] JOB Ethanol FINISHED
[29.01|00:55:08] JOB Ethanol SUCCESSFUL
[29.01|00:55:08] PLAMS run finished. Goodbye
`,
        stderr: "",
      },
    ],
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      // Simulate /current_job API call
      const currentJobResponse = await new Promise((resolve) =>
        setTimeout(() => resolve(mockCurrentJobResponse), 1000)
      );

      // Check if the current job matches the payload data
      if (
        currentJobResponse.current_job &&
        currentJobResponse.current_job.function_name === "AddMolecule" &&
        currentJobResponse.current_job.data.compoundName === material &&
        currentJobResponse.current_job.data.cas === casNumber &&
        currentJobResponse.current_job.data.smiles === smiles
      ) {
        setLogStatus("Process is still running...");
        toast.info("Process is still running. Please check again later.");
        return;
      }

      // Simulate /job_logs API call
      const logsResponse = await new Promise((resolve) =>
        setTimeout(() => resolve(mockJobLogsResponse), 1000)
      );

      // Find the most recent log that matches the compoundName, smiles, and cas
      const relevantLog = logsResponse.logs.find((log) =>
        log.stdout.includes(material) &&
        log.stdout.includes(smiles) &&
        log.stdout.includes(casNumber)
      );

      if (relevantLog) {
        const jobSuccessMessage = `JOB ${material} SUCCESSFUL`;
        if (relevantLog.stdout.includes(jobSuccessMessage)) {
          setLogStatus("Process completed successfully.");
          setIsDownloadEnabled(true);
          toast.success("Process completed. Download is now enabled.");
        } else {
          // Extract errors from stderr
          const errorRegex = /\[(\d{2}:\d{2}:\d{2})\]\s+(.*)/g;
          let errors: Set<string> = new Set();

          let errorMatch: RegExpExecArray | null;
          while ((errorMatch = errorRegex.exec(relevantLog.stderr)) !== null) {
            const timeStamp = errorMatch[1];
            const message = errorMatch[2];
            errors.add(`[${timeStamp}] ${message}`);
          }

          setLogStatus(
            `Process completed with errors:\n${Array.from(errors).join("\n") || "No errors found."}`
          );
          toast.error("Errors encountered during process execution.");
        }
      } else {
        setLogStatus("No matching logs found for this compound.");
        toast.info("No matching logs found for this compound.");
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Could not fetch logs. Please try again later.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleCheckStatus}
        disabled={isChecking}
        style={{ padding: "10px 20px", fontSize: "16px" }}
      >
        {isChecking ? "Checking..." : "Check Status"}
      </button>

      <div style={{ marginTop: "20px" }}>
        <h3>Log Status:</h3>
        <textarea
          value={logStatus}
          readOnly
          style={{ width: "100%", height: "200px", padding: "10px" }}
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <button
          disabled={!isDownloadEnabled}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          Download
        </button>
      </div>
    </div>
  );
};

export default TestComponent;