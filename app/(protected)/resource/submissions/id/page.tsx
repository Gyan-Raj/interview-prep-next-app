"use client";

import { useFormik } from "formik";
import * as yup from "yup";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  getMySubmissions_Resource,
  updateSubmissionDetail_Resource,
} from "@/app/actions";

import { statusColorMap } from "@/app/constants/constants";
import { toSentenceCase } from "@/app/utils/utils";
import { SubmissionStatusKey } from "@/app/types";

/* -------------------- Types -------------------- */

type Question = {
  text: string;
  media?: string;
};

type FormValues = {
  questions: Question[];
};

type ActionType = "save" | "submit";
type SubmissionHeader = {
  status: SubmissionStatusKey;
};

/* -------------------- Form config -------------------- */

const validationSchema = yup.object({
  questions: yup.array(
    yup.object({
      text: yup.string().required("Question is required"),
      media: yup.string().nullable(),
    })
  ),
});

export default function ResourceSubmissionDetailPage() {
  const router = useRouter();
  const { submissionId } = useParams<{ submissionId: string }>();

  const [isLoading, setIsLoading] = useState(false);
  const [submission, setSubmission] = useState<SubmissionHeader | null>(null);
  const [initialQuestions, setInitialQuestions] = useState<Question[]>([]);
  const [action, setAction] = useState<ActionType>("save");

  const isEditable =
    submission?.status === "DRAFT" || submission?.status === "REJECTED";

  /* -------------------- Fetch submission -------------------- */

  useEffect(() => {
    async function load() {
      if (!submissionId) return;

      setIsLoading(true);
      try {
        const res = await getMySubmissions_Resource({ submissionId });

        if (res.status === 200) {
          const { submissionVersion, questions } = res.data;
          setSubmission(submissionVersion);
          setInitialQuestions(questions);
        }
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [submissionId]);

  /* -------------------- Formik -------------------- */

  const formik = useFormik<FormValues>({
    initialValues: { questions: initialQuestions },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!submissionId || values.questions.length === 0) return;

      const payload = {
        submissionId,
        action, // "save" | "submit"
        questions: values.questions,
      };

      const res = await updateSubmissionDetail_Resource(payload);

      if (res.status === 200) {
        router.replace("/resource/submissions");
      }
    },
  });

  if (isLoading || !submission) {
    return <div className="p-4 text-sm opacity-70">Loading...</div>;
  }

  /* -------------------- Render -------------------- */

  return (
    <div className="relative space-y-6">
      {/* Status badge */}
      <div
        className={`absolute top-4 right-4 text-xs font-medium ${
          statusColorMap[submission.status]
        }`}
      >
        {toSentenceCase(submission.status)}
      </div>

      {/* Questions form / list */}
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {/* TODO: render questions list + inputs here */}

        {isEditable && (
          <div className="flex gap-3">
            <button
              type="button"
              className="px-4 py-2 text-sm border"
              onClick={() => {
                setAction("save");
                formik.submitForm();
              }}
            >
              Save
            </button>

            <button
              type="button"
              className="btn-primary px-4 py-2 text-sm"
              onClick={() => {
                setAction("submit");
                formik.submitForm();
              }}
            >
              Submit
            </button>
          </div>
        )}

        {!isEditable && (
          <div className="text-sm opacity-70">
            This submission is under review or approved. Editing is disabled.
          </div>
        )}
      </form>
    </div>
  );
}
