"use client";

import { useEffect, useRef, useState } from "react";
import { Filter } from "lucide-react";

import { useDebounce, useOutsideClick } from "@/app/hooks/hooks";
import { toSentenceCase } from "@/app/utils/utils";
import {
  getAllCompanies,
  getAllQuestions,
  getAllRoles,
  getAllRounds,
} from "@/app/actions";
import { QuestionRow } from "@/app/types";
import QuestionsList from "@/app/components/questions/QuestionsList";
import { useRouter } from "next/navigation";
import InfiniteScrollWrapper from "@/app/components/InfiniteScrollWrapper";

type Option = { id: string; name: string };

export default function Questions() {
  const rolesDropdownRef = useRef<HTMLDivElement | null>(null);
  const companiesDropdownRef = useRef<HTMLDivElement | null>(null);
  const roundsDropdownRef = useRef<HTMLDivElement | null>(null);

  const [query, setQuery] = useState("");
  const [allRoles, setAllRoles] = useState<Option[]>([]);
  const [allCompanies, setAllCompanies] = useState<Option[]>([]);
  const [allRounds, setAllRounds] = useState<Option[]>([]);

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedRounds, setSelectedRounds] = useState<string[]>([]);

  const [rolesOpen, setRolesOpen] = useState(false);
  const [companiesOpen, setCompaniesOpen] = useState(false);
  const [roundsOpen, setRoundsOpen] = useState(false);

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
      setSelectedRoles(roles.map((r) => r.id));
    }
  }

  async function fetchCompanies() {
    const res = await getAllCompanies();
    if (res.status === 200) {
      const companies: Option[] = res.data;
      setAllCompanies(companies);
      setSelectedCompanies(companies.map((c) => c.id));
    }
  }

  async function fetchRounds() {
    const res = await getAllRounds();
    if (res.status === 200) {
      const rounds: Option[] = res.data;
      setAllRounds(rounds);
      setSelectedRounds(rounds.map((r) => r.id));
    }
  }

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
    if (!isAllRolesSelected) setSelectedRoles(allRoles.map((r) => r.id));
  }
  function toggleAllCompanies() {
    if (!isAllCompaniesSelected)
      setSelectedCompanies(allCompanies.map((c) => c.id));
  }
  function toggleAllRounds() {
    if (!isAllRoundsSelected) setSelectedRounds(allRounds.map((c) => c.id));
  }

  useOutsideClick(rolesDropdownRef, () => setRolesOpen(false));
  useOutsideClick(companiesDropdownRef, () => setCompaniesOpen(false));
  useOutsideClick(roundsDropdownRef, () => setRoundsOpen(false));

  const rolesLabel = isAllRolesSelected
    ? "All Roles"
    : selectedRoles
        .map((id) => allRoles.find((r) => r.id === id)?.name)
        .filter(Boolean)
        .map((v) => toSentenceCase(v!))
        .join(", ");

  const companiesLabel = isAllCompaniesSelected
    ? "All Companies"
    : selectedCompanies
        .map((id) => allCompanies.find((c) => c.id === id)?.name)
        .filter(Boolean)
        .map((v) => toSentenceCase(v!))
        .join(", ");

  const roundsLabel = isAllRoundsSelected
    ? "All Rounds"
    : selectedRounds
        .map((id) => allRounds.find((c) => c.id === id)?.name)
        .filter(Boolean)
        .map((v) => toSentenceCase(v!))
        .join(", ");

  /* ---------------- Render ---------------- */

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <input
          placeholder="Search questions"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-3 py-2 text-sm outline-none"
          style={{
            backgroundColor: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-card)",
          }}
        />

        {/* Companies Filter */}
        <div className="flex items-center gap-3 flex-nowrap">
          <div ref={companiesDropdownRef} className="relative">
            <button
              onClick={() => setCompaniesOpen((v) => !v)}
              className="px-3 py-2 text-sm whitespace-nowrap flex items-center gap-1"
              style={{
                backgroundColor: "var(--color-panel)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-card)",
                color: "var(--color-text)",
              }}
            >
              <Filter size={14} style={{ opacity: 0.7 }} />
              {companiesLabel || "Select company"}
            </button>

            {companiesOpen && (
              <div
                className="absolute right-0 mt-2 w-56 p-3 space-y-2 z-20"
                style={{
                  backgroundColor: "var(--color-panel)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-card)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                {/* All */}
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isAllCompaniesSelected}
                    disabled={isAllCompaniesSelected}
                    onChange={toggleAllCompanies}
                  />
                  <span>All Companies</span>
                </label>

                <hr style={{ borderColor: "var(--color-border)" }} />

                {allCompanies?.map((company) => (
                  <label
                    key={company.id}
                    className="flex items-center gap-2 text-sm"
                    style={{ opacity: isAllCompaniesSelected ? 0.5 : 1 }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCompanies.includes(company.id)}
                      disabled={
                        selectedCompanies.length === 1 &&
                        selectedCompanies[0] === company.id
                      }
                      onChange={() => toggleCompany(company.id)}
                    />
                    {company.name}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rounds Filter */}
        <div className="flex items-center gap-3 flex-nowrap">
          <div ref={roundsDropdownRef} className="relative">
            <button
              onClick={() => setRoundsOpen((v) => !v)}
              className="px-3 py-2 text-sm whitespace-nowrap flex items-center gap-1"
              style={{
                backgroundColor: "var(--color-panel)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-card)",
                color: "var(--color-text)",
              }}
            >
              <Filter size={14} style={{ opacity: 0.7 }} />
              {roundsLabel || "Select round"}
            </button>

            {roundsOpen && (
              <div
                className="absolute right-0 mt-2 w-56 p-3 space-y-2 z-20"
                style={{
                  backgroundColor: "var(--color-panel)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-card)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                {/* All */}
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isAllRoundsSelected}
                    disabled={isAllRoundsSelected}
                    onChange={toggleAllRounds}
                  />
                  <span>All Rounds</span>
                </label>

                <hr style={{ borderColor: "var(--color-border)" }} />

                {allRounds?.map((round) => (
                  <label
                    key={round.id}
                    className="flex items-center gap-2 text-sm"
                    style={{ opacity: isAllRoundsSelected ? 0.5 : 1 }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRounds.includes(round.id)}
                      disabled={
                        selectedRounds.length === 1 &&
                        selectedRounds[0] === round.id
                      }
                      onChange={() => toggleRound(round.id)}
                    />
                    {round.name}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Roles Filter */}
        <div className="flex items-center gap-3 flex-nowrap">
          <div ref={rolesDropdownRef} className="relative">
            <button
              onClick={() => setRolesOpen((v) => !v)}
              className="px-3 py-2 text-sm whitespace-nowrap flex items-center gap-1"
              style={{
                backgroundColor: "var(--color-panel)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-card)",
                color: "var(--color-text)",
              }}
            >
              <Filter size={14} style={{ opacity: 0.7 }} />
              {rolesLabel || "Select role"}
            </button>

            {rolesOpen && (
              <div
                className="absolute mt-2 w-56 p-3 space-y-2 z-20 right-0"
                style={{
                  backgroundColor: "var(--color-panel)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-card)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                {/* All */}
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isAllRolesSelected}
                    disabled={isAllRolesSelected}
                    onChange={toggleAllRoles}
                  />
                  <span>All Roles</span>
                </label>

                <hr style={{ borderColor: "var(--color-border)" }} />

                {allRoles?.map((role) => (
                  <label
                    key={role.id}
                    className="flex items-center gap-2 text-sm"
                    style={{ opacity: isAllRolesSelected ? 0.5 : 1 }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.id)}
                      disabled={
                        selectedRoles.length === 1 &&
                        selectedRoles[0] === role.id
                      }
                      onChange={() => toggleRole(role.id)}
                    />
                    {role.name}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <InfiniteScrollWrapper<QuestionRow>
        fetchPage={async ({ page, limit }) => {
          const res = await getAllQuestions({
            searchText: debouncedQuery,
            roleIds: debouncedRoles,
            companyIds: debouncedCompanies,
            roundIds: debouncedRounds,
            approvedOnly: true,
            sort: "desc",
            page,
            limit,
          });

          if (res.status !== 200) {
            throw new Error("Failed to fetch questions");
          }

          return {
            items: res.data.questions.map((q: any) => ({
              id: q.id,
              text: q.text,
              createdAt: q.createdAt,
              interview: q.interview,
            })) as QuestionRow[],
            hasMore: Boolean(res.data.hasMore),
          };
        }}
        deps={[
          debouncedQuery,
          debouncedRoles.join(","),
          debouncedCompanies.join(","),
          debouncedRounds.join(","),
        ]}
        initialLimit={20}
        emptyMessage={
          <div className="text-sm opacity-60">No questions found.</div>
        }
      >
        {(questions) => (
          <QuestionsList
            questions={questions}
            onItemClick={(question) => {
              const params = new URLSearchParams({
                role: question.interview.role ?? "",
                text: question.text,
              });
              router.push(
                `/resource/questions/${question.id}?${params.toString()}`
              );
            }}
            renderActions={() => ""}
          />
        )}
      </InfiniteScrollWrapper>
    </div>
  );
}
