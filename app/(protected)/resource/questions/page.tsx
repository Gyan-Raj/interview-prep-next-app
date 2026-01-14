"use client";

import { useEffect, useRef, useState } from "react";

import { useDebounce } from "@/app/hooks/hooks";
import {
  getAllQuestions,
  getAllCompanies,
  getAllRoles,
  getAllRounds,
} from "@/app/actions";
import { FilterConfig, QuestionRow } from "@/app/types";
import QuestionsList from "@/app/components/questions/QuestionsList";
import { useRouter } from "next/navigation";
import FiltersMenu from "@/app/components/filters/FiltersMenu";
import ListToolbar from "@/app/components/list/ListToolbar";
import SearchInput from "@/app/components/SearchInput";

type Option = {
  id: string;
  name: string;
};

function Questions() {
  const [query, setQuery] = useState("");
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
  const router = useRouter();

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
    fetchQuestions();
  }, [
    debouncedQuery,
    debouncedRoles,
    debouncedCompanies,
    debouncedRounds,
    isReady,
  ]);

  const questionsCache = useRef<Map<string, QuestionRow[]>>(new Map());

  async function fetchQuestions() {
    const cacheKey = JSON.stringify({
      q: debouncedQuery,
      r: debouncedRoles,
      c: debouncedCompanies,
      rd: debouncedRounds,
    });

    if (questionsCache.current.has(cacheKey)) {
      setQuestions(questionsCache.current.get(cacheKey)!);
      return;
    }
    setIsLoading(true);
    try {
      const res = await getAllQuestions({
        searchText: debouncedQuery,
        roleIds: debouncedRoles,
        companyIds: debouncedCompanies,
        roundIds: debouncedRounds,
        approvedOnly: true,
        sort: "desc",
      });

      if (res.status === 200) {
        const normalized = res.data.questions.map((q: any) => ({
          id: q.id,
          text: q.text,
          tags: q.tags,
          mediaUrl: q.mediaUrl,
          interview: {
            companyName: q.interview?.companyName,
            role: q.interview?.role,
            round: q.interview?.round,
            interviewDate: q.interview?.interviewDate,
          },
        }));

        questionsCache.current.set(cacheKey, normalized);
        setQuestions(normalized);
      }
    } finally {
      setIsLoading(false);
    }
  }

  /* ---------------- Helpers ---------------- */

  function toggleRole(id: string) {
    setSelectedRoles((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleCompany(id: string) {
    setSelectedCompanies((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleRound(id: string) {
    setSelectedRounds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
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
            placeholder="Search questions"
          />
        }
        right={<FiltersMenu filters={filtersConfig} />}
      />

      {/* List */}
      <QuestionsList
        questions={questions}
        onItemClick={(question) => {
          const params = new URLSearchParams({
            role: question.interview.role ?? "",
            text: question.text,
          });
          return router.push(
            `/resource/questions/${question.id}?${params.toString()}`
          );
        }}
        renderActions={() => ""}
        isLoading={isLoading}
      />
    </div>
  );
}

export default Questions;
