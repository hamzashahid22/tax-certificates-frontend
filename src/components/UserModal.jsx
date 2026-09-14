import WorkspaceDialog from "./WorkspaceDialog";
import { useState, useEffect, useRef } from "react";

const formatCnic = (value) => {
  const digits = value.replace(/[^0-9]/g, "").slice(0, 13);
  return [digits.slice(0, 5), digits.slice(5, 12), digits.slice(12)].filter(Boolean).join("-");
};

const isCnicFormat = (value) => /^\d{5}-\d{7}-\d$/.test(value);

function UserModal({ open, onClose, onSave, user, elegant = false }) {
  const cnicInputRef = useRef(null);
  const [formData, setFormData] = useState({ name: "", address: "", cnic: "", ntn: "" });

  useEffect(() => {
    if (user) {
      const cnicVal = user.cnic || "";
      const ntnVal = user.ntn || "";
      const displayValue = cnicVal || ntnVal;
      setFormData({ name: user.name || "", address: user.address || "", cnic: displayValue, ntn: ntnVal });
    } else {
      setFormData({ name: "", address: "", cnic: "", ntn: "" });
    }
  }, [user, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "cnic") {
      const isCnic = /^\d{5}-\d{7}-\d$/.test(value);
      setFormData((prev) => ({
        ...prev,
        cnic: value,
        ntn: isCnic ? "" : value,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = () => {
    if (!cnicInputRef.current?.reportValidity()) return;
    onSave({ name: formData.name, address: formData.address, cnic: isCnicFormat(formData.cnic) ? formData.cnic : "", ntn: isCnicFormat(formData.cnic) ? "" : formData.ntn });
    onClose();
  };

  if (!open) return null;

  if (elegant) return (
    <WorkspaceDialog open={open} onClose={onClose} title={user ? "Edit user details" : "Add a new user"}
      description={user ? "Keep customer information accurate and up to date." : "Create a customer profile for your tax certificates."}
      actions={<><button className="workspace-button" onClick={onClose}>Cancel</button><button className="workspace-button workspace-button-primary" type="submit" form="workspace-user-form">{user ? "Save changes" : "Save user"}</button></>}>
      <form id="workspace-user-form" className="workspace-form" onSubmit={(event) => { event.preventDefault(); handleSubmit(); }}>
        <div className="workspace-field"><label htmlFor="workspace-name">Full name <span>Required</span></label><input autoFocus id="workspace-name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter the customer's full name" autoComplete="name" /></div>
        <div className="workspace-field"><label htmlFor="workspace-address">Address <span>Required</span></label><textarea id="workspace-address" name="address" value={formData.address} onChange={handleChange} placeholder="House / office, street, area and city" rows={3} autoComplete="street-address" /></div>
        <div className="workspace-field"><label htmlFor="workspace-cnic">CNIC / NTN</label><input id="workspace-cnic" name="cnic" ref={cnicInputRef} inputMode="numeric" value={formData.cnic} onChange={handleChange} placeholder="Enter CNIC (42201-1234567-1) or NTN number" /></div>
      </form>
    </WorkspaceDialog>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {user ? "Edit User" : "Add User"}
                </h2>
                <p className="text-sm text-gray-500">
                  {user ? "Update user information" : "Fill in the details below"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 pb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-gray-50 hover:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter full address"
              rows={3}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-gray-50 hover:bg-white resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              CNIC / NTN
            </label>
            <input
              type="text"
              name="cnic"
              value={formData.cnic}
              onChange={handleChange}
              placeholder="e.g. 42201-3183229-7 or NTN number"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-gray-50 hover:bg-white font-mono"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-xl shadow-sm hover:shadow-md transition-all"
          >
            {user ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserModal;
