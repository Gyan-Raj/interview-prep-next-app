"use client";

import { useEffect, useState } from "react";
import Modal from "@/app/components/Modal";
import { sendInvite_Admin, getAllRoles_Admin } from "@/app/actions";
import { toSentenceCase } from "@/app/utils/utils";
import { useFormik } from "formik";
import * as yup from "yup";
import { Role } from "@/app/types";

type AddUserModalProps = {
  onClose: () => void;
  onAddUser: () => void;
};

type AddUserFormValues = {
  name: string;
  email: string;
  phone: string;
  roleIds: string[];
};

const initialValues: AddUserFormValues = {
  name: "",
  email: "",
  phone: "",
  roleIds: [],
};

const validationSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().required("Phone is required"),
  roleIds: yup
    .array()
    .of(yup.string())
    .min(1, "You must select at least one role"),
});

export default function AddUserModal({
  onClose,
  onAddUser,
}: AddUserModalProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const formik = useFormik<AddUserFormValues>({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const res = await sendInvite_Admin(values);
        if (res.status === 201) {
          onAddUser();
        }
      } catch (error) {
        console.error("Error sending invite link (admin/user)", error);
      }
    },
  });

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await getAllRoles_Admin();
        if (res.status === 200) {
          setRoles(res.data);
        }
      } catch (e) {
        console.error("Error fetching roles (AddUserModal)", e);
      } finally {
        setLoadingRoles(false);
      }
    }
    fetchRoles();
  }, []);

  function toggleRole(roleId: string) {
    const currentRoles = formik.values.roleIds;

    if (currentRoles.includes(roleId)) {
      formik.setFieldValue(
        "roleIds",
        currentRoles.filter((id: string) => id !== roleId)
      );
    } else {
      formik.setFieldValue("roleIds", [...currentRoles, roleId]);
    }
  }

  return (
    <Modal
      title="Add User"
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={formik.submitForm}
            className="btn-primary px-4 py-2 text-sm border"
          >
            Add User
          </button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={formik.handleSubmit}>
        {/* Name */}
        <input
          placeholder="Name *"
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
          className="w-full px-3 py-2 text-sm outline-none"
          style={{
            backgroundColor: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-card)",
          }}
        />

        {/* Email */}
        <input
          placeholder="Email *"
          name="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          className="w-full px-3 py-2 text-sm outline-none"
          style={{
            backgroundColor: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-card)",
          }}
        />

        {/* Phone */}
        <input
          placeholder="Phone *"
          name="phone"
          value={formik.values.phone}
          onChange={formik.handleChange}
          className="w-full px-3 py-2 text-sm outline-none"
          style={{
            backgroundColor: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-card)",
          }}
        />

        {/* Roles */}
        <div className="space-y-2">
          <div className="text-sm font-medium opacity-80">Assign roles *</div>

          <div
            className="max-h-40 overflow-auto space-y-2 p-2 rounded"
            style={{
              backgroundColor: "var(--color-panel)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-card)",
            }}
          >
            {loadingRoles ? (
              <div className="text-sm opacity-60">Loading roles…</div>
            ) : (
              roles.map((role) => (
                <label
                  key={role.id}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formik.values.roleIds.includes(role.id)}
                    onChange={() => toggleRole(role.id)}
                  />

                  {toSentenceCase(role.name)}
                </label>
              ))
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
