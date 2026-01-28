"use client";

import { useEffect, useRef, useState } from "react";

import { useDebounce } from "@/app/hooks/hooks";
import {
  getAllQuestions,
  getAllCompanies,
  getAllRoles,
  getAllRounds,
  getSubmissions_Resource,
} from "@/app/actions";
import {
  ConfirmAction,
  FilterConfig,
  QuestionRow,
  ResourceSubmissionRow,
} from "@/app/types";
import QuestionsList from "@/app/components/questions/QuestionsList";
import { useRouter } from "next/navigation";
import FiltersMenu from "@/app/components/filters/FiltersMenu";
import ListToolbar from "@/app/components/list/ListToolbar";
import SearchInput from "@/app/components/SearchInput";
import SubmissionsList from "@/app/components/submissions/SubmissionsList";
import SubmissionActionsMenu from "@/app/components/submissions/SubmissionActionsMenu";
import { Download } from "lucide-react";
import DownloadButton from "@/app/components/DownloadButton";

type Option = {
  id: string;
  name: string;
};

function AllApprovedResourceSubmissions() {
  const [submissions, setSubmissions] = useState<ResourceSubmissionRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [query, setQuery] = useState("");

  const [allRoles, setAllRoles] = useState<Option[]>([]);
  const [allCompanies, setAllCompanies] = useState<Option[]>([]);
  const [allRounds, setAllRounds] = useState<Option[]>([]);

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedRounds, setSelectedRounds] = useState<string[]>([]);

  const debouncedQuery = useDebounce(query, 400);
  const debouncedRoles = useDebounce(selectedRoles, 400);
  const debouncedCompanies = useDebounce(selectedCompanies, 400);
  const debouncedRounds = useDebounce(selectedRounds, 400);

  const isAllRolesSelected =
    allRoles?.length > 0 && selectedRoles?.length === allRoles?.length;

  const isAllCompaniesSelected =
    allCompanies?.length > 0 &&
    selectedCompanies.length === allCompanies.length;

  const isAllRoundsSelected =
    allRounds?.length > 0 && selectedRounds.length === allRounds.length;

  /* ---------------- Fetch master data ---------------- */

  useEffect(() => {
    fetchRoles();
    fetchCompanies();
    fetchRounds();
  }, []);

  async function fetchRoles() {
    const res = await getAllRoles();
    if (res.status === 200) {
      const roles: Option[] = res.data;
      setAllRoles(roles);
      setSelectedRoles(roles?.map((r) => r.id));
    }
  }

  async function fetchCompanies() {
    const res = await getAllCompanies();
    if (res.status === 200) {
      const companies: Option[] = res.data;
      setAllCompanies(companies);
      setSelectedCompanies(companies?.map((c) => c.id));
    }
  }

  async function fetchRounds() {
    const res = await getAllRounds();
    if (res.status === 200) {
      const rounds: Option[] = res.data;
      setAllRounds(rounds);
      setSelectedRounds(rounds?.map((c) => c.id));
    }
  }

  /* ---------------- Fetch questions ---------------- */

  const isReady =
    selectedRoles.length > 0 &&
    selectedCompanies.length > 0 &&
    selectedRounds.length > 0;

  useEffect(() => {
    if (!isReady) return;
    fetchAllSubmissions();
  }, [
    debouncedQuery,
    debouncedRoles,
    debouncedCompanies,
    debouncedRounds,
    isReady,
  ]);

  async function fetchAllSubmissions() {
    setIsLoading(true);
    try {
      const res = await getSubmissions_Resource({
        searchText: debouncedQuery,
        submissionStatuses: ["APPROVED"],
        isSelf: false,
      });

      if (res.status === 200) {
        setSubmissions(res.data);
      }
    } catch (e) {
      console.error("Error fetching submissions", e);
    } finally {
      setIsLoading(false);
    }
  }

  /* ---------------- Helpers ---------------- */

  function toggleRole(id: string) {
    setSelectedRoles((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleCompany(id: string) {
    setSelectedCompanies((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleRound(id: string) {
    setSelectedRounds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleAllRoles() {
    if (!isAllRolesSelected) {
      setSelectedRoles(allRoles.map((r) => r.id));
    }
  }

  function toggleAllCompanies() {
    if (!isAllCompaniesSelected) {
      setSelectedCompanies(allCompanies.map((c) => c.id));
    }
  }

  function toggleAllRounds() {
    if (!isAllRoundsSelected) {
      setSelectedRounds(allRounds.map((c) => c.id));
    }
  }

  /* ---------------- Labels ---------------- */

  const filtersConfig: FilterConfig[] = [
    {
      key: "roles",
      label: "Roles",
      options: allRoles,
      selected: selectedRoles,
      isAllSelected: isAllRolesSelected,
      onToggle: toggleRole,
      onSelectAll: toggleAllRoles,
    },
    {
      key: "companies",
      label: "Companies",
      options: allCompanies,
      selected: selectedCompanies,
      isAllSelected: isAllCompaniesSelected,
      onToggle: toggleCompany,
      onSelectAll: toggleAllCompanies,
    },
    {
      key: "rounds",
      label: "Rounds",
      options: allRounds,
      selected: selectedRounds,
      isAllSelected: isAllRoundsSelected,
      onToggle: toggleRound,
      onSelectAll: toggleAllRounds,
    },
  ];

  /* ---------------- Render ---------------- */

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <ListToolbar
        left={
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search submissions"
          />
        }
        right={
          <>
            <DownloadButton hoverText="Download All" />
            <FiltersMenu filters={filtersConfig} />
          </>
        }
      />

      {/* List */}
      <div style={{ position: "relative" }}>
        <SubmissionsList
          submissions={submissions}
          onItemClick={(submission) =>
            router.push(`/resource/submissions/${submission.submissionId}`)
          }
          isLoading={isLoading}
          renderActions={(submission) => {
            return <DownloadButton />;
          }}
          kind="submission"
        />
      </div>
    </div>
  );
}

export default AllApprovedResourceSubmissions;
