"use client";

import Modal from "@/app/components/Modal";
import { useFormik } from "formik";
import * as yup from "yup";
import SearchSelect from "@/app/components/SearchSelect";

import {
  getCompanies_ResourceManager,
  getResources_ResourceManager,
  getInterviewRoles_ResourceManager,
  getInterviewRounds_ResourceManager,
  postRequestSubmission_ResourceManager,
} from "@/app/actions";
import { Option, RequestSubmissionPayload } from "@/app/types";

type RequestSubmissionModalProps = {
  onClose: () => void;
  onAddSubmissionRequest: () => void;
};

/**
 * IMPORTANT:
 * We store selected values as Option | null,
 * NOT just ids, so we can send { id } OR { name }
 */
type FormValues = {
  company: Option | null;
  resource: Option | null;
  role: Option | null;
  round: Option | null;
  interviewDate: string;
};

const initialValues: FormValues = {
  company: null,
  resource: null,
  role: null,
  round: null,
  interviewDate: "",
};

const validationSchema = yup.object({
  company: yup.object().required("Company is required"),
  resource: yup.object().required("Resource is required"),
  role: yup.object().required("Role is required"),
  round: yup.object().required("Round is required"),
  interviewDate: yup.string().required("Interview date is required"),
});

export default function RequestSubmissionModal({
  onClose,
  onAddSubmissionRequest,
}: RequestSubmissionModalProps) {
  const formik = useFormik<FormValues>({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      if (!values.resource?.id) {
        return; // or throw / show toast
      }
      /**
       * Shape payload for backend:
       * - If id exists → reuse
       * - If id missing → backend creates entity
       */
      const payload: RequestSubmissionPayload = {
        company: values.company?.id
          ? { id: values.company.id }
          : { name: values.company?.name },

        role: values.role?.id
          ? { id: values.role.id }
          : { name: values.role?.name },

        round: values.round?.id
          ? { id: values.round.id }
          : { name: values.round?.name },

        resourceId: values.resource!.id,
        interviewDate: values.interviewDate,
      };

      const res = await postRequestSubmission_ResourceManager(payload);

      if (res.status === 201) {
        onAddSubmissionRequest();
      }
    },
  });

  return (
    <Modal
      title="Request Submission"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm border">
            Cancel
          </button>

          <button
            onClick={formik.submitForm}
            className="btn-primary px-4 py-2 text-sm"
          >
            Submit Request
          </button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={formik.handleSubmit}>
        {/* Company */}
        <SearchSelect
          label="Company *"
          value={formik.values.company}
          onChange={(opt) => formik.setFieldValue("company", opt)}
          fetchOptions={(q) =>
            getCompanies_ResourceManager({ searchText: q }).then((r) => r.data)
          }
          allowCreate
        />

        {/* Resource (NO create) */}
        <SearchSelect
          label="Resource *"
          value={formik.values.resource}
          onChange={(opt) => formik.setFieldValue("resource", opt)}
          fetchOptions={(q) =>
            getResources_ResourceManager({ searchText: q }).then((r) => r.data)
          }
          allowCreate={false}
        />

        {/* Role */}
        <SearchSelect
          label="Role *"
          value={formik.values.role}
          onChange={(opt) => formik.setFieldValue("role", opt)}
          fetchOptions={(q) =>
            getInterviewRoles_ResourceManager({ searchText: q }).then((r) => r.data)
          }
          allowCreate
        />

        {/* Round */}
        <SearchSelect
          label="Round *"
          value={formik.values.round}
          onChange={(opt) => formik.setFieldValue("round", opt)}
          fetchOptions={(q) =>
            getInterviewRounds_ResourceManager({ searchText: q }).then((r) => r.data)
          }
          allowCreate
        />

        {/* Interview Date */}
        <div className="space-y-1">
          <label className="text-sm font-medium opacity-80">
            Interview Date *
          </label>

          <input
            type="date"
            value={formik.values.interviewDate}
            onChange={(e) =>
              formik.setFieldValue("interviewDate", e.target.value)
            }
            className="w-full px-3 py-2 text-sm outline-none"
            style={{
              backgroundColor: "var(--color-panel)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-card)",
            }}
          />
        </div>
      </form>
    </Modal>
  );
}
