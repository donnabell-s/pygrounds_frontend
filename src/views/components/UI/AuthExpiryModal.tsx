import React from 'react';
import * as Component from '../../components';

type Props = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};
// 
const AuthExpiryModal: React.FC<Props> = ({ open, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(45, 45, 45, 0.4)' }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-[90%] max-w-md p-6 relative flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-expiry-title"
      >
        <h3 id="auth-expiry-title" className="text-xl font-bold text-[#704EE7]">Session expired</h3>
        <p className="text-sm mt-1 text-[#2D2D2D]">Your session has expired. You can sign out now and sign back in, or stay on this page (you will be signed out on refresh).</p>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onCancel}
            className="px-1.5 py-2 cursor-pointer font-semibold text-[#2D2D2D]"
          >
            Stay on page
          </button>

          <Component.PrimaryButton label="Sign out" onClick={onConfirm} py="py-2" fontSize="text-md" />
        </div>
      </div>
    </div>
  );
};

export default AuthExpiryModal;
