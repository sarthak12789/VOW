import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinWorkspace } from "../../api/authApi.js"; 

const Join = () => {
  const navigate = useNavigate();

  const [inviteCode, setInviteCode] = useState("");
  const [workspaceDetails, setWorkspaceDetails] = useState(null);
  const [loading, setLoading] = useState(false);


  const handleVerify = async () => {
    if (!inviteCode.trim()) {
      alert("Please enter an invite code");
      return;
    }
    setLoading(true);
    try {
      const response = await joinWorkspace(inviteCode);
      const { workspace, workspaceToken } = response.data;
      setWorkspaceDetails({ ...workspace, workspaceToken });
    } catch (error) {
      alert(error.response?.data?.message || "Invalid invite code");
    } finally {
      setLoading(false);
    }
  };



  const confirmJoin = () => {
    if (!workspaceDetails) return;

    localStorage.setItem("workspaceId", workspaceDetails._id);
    localStorage.setItem("inviteCode", workspaceDetails.inviteCode);
    localStorage.setItem("workspaceToken", workspaceDetails.workspaceToken);

    alert(`Joined workspace: ${workspaceDetails.workspaceName}`);
    navigate("/map"); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-[#450B7B] mb-4 text-center">
          Join Workspace
        </h2>

        {!workspaceDetails ? (
          <>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Invite Code
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter invite code"
              className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full bg-[#450B7B] text-white px-4 py-2 rounded-md hover:bg-[#5c0ea4] transition disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </>
        ) : (
          <div className="text-center">
            <p className="mb-4 text-gray-700">
              Workspace found:{" "}
              <strong>{workspaceDetails.workspaceName}</strong>
            </p>
            <button
              onClick={confirmJoin}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              Confirm Join
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Join;