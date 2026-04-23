import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminTable, BackButton } from "../../../components/UI";
import { FiEdit2, FiRefreshCw, FiX } from "react-icons/fi";
import flagApi, { type FlaggedQuestion, type FlagCountByLevel } from "../../../../api/flagApi";
import { adminApi } from "../../../../api/adminApi";
import type { RegenerationPreviewResponse } from "../../../../types/questions";

// ============================================================
// TYPES
// ============================================================

type UserLevel = "beginner" | "intermediate" | "advanced" | "master";

type FlaggedQuestionRow = {
  id: number;
  question: string;
  game: string;
  flagged_by: string;
  notes: string | null;
  created_at: string | null;
  difficulty: string;
  answer_options?: Record<string, string> | null;
  correct_answer?: string | null;
  game_data?: Record<string, any> | null;
  flag_count_by_level: FlagCountByLevel;
};

const THRESHOLDS: Record<UserLevel, number> = {
  master: 1,
  advanced: 2,
  intermediate: 3,
  beginner: 5,
};

const LEVEL_STYLES: Record<UserLevel, { bg: string; text: string; label: string }> = {
  master:       { bg: "bg-purple-100", text: "text-purple-800", label: "Master" },
  advanced:     { bg: "bg-red-100",    text: "text-red-800",    label: "Advanced" },
  intermediate: { bg: "bg-orange-100", text: "text-orange-800", label: "Intermediate" },
  beginner:     { bg: "bg-blue-100",   text: "text-blue-800",   label: "Beginner" },
};

const LEVELS: UserLevel[] = ["master", "advanced", "intermediate", "beginner"];

// ============================================================
// HELPERS
// ============================================================

function buildOptionsText(answer_options: unknown): string {
  if (!answer_options) return "";
  try {
    const options = typeof answer_options === "string" ? JSON.parse(answer_options) : answer_options;
    if (Array.isArray(options)) {
      return "\n\nOptions:\n" + options.map((o) => `- ${String(o)}`).join("\n");
    }
    if (typeof options === "object" && options !== null) {
      return "\n\nOptions:\n" + Object.entries(options as Record<string, unknown>).map(([k, v]) => `${k}: ${v}`).join("\n");
    }
    return "\n\nOptions:\n" + String(options);
  } catch {
    return "\n\nOptions:\n" + String(answer_options);
  }
}

function buildInitialPrompt(item: FlaggedQuestionRow): string {
  const optionsText = buildOptionsText(item.answer_options);

  if (item.game === "coding") {
    const gd = item.game_data ?? {};
    const correctCode = gd.correct_code || gd.solution || item.correct_answer;
    const lines = [
      `Question to regenerate (Hangman):\n${item.question}`,
      gd.buggy_question_text ? `\nBuggy Question Text (Debugging):\n${gd.buggy_question_text}` : "",
      gd.function_name ? `\nFunction Name: ${gd.function_name}` : "",
      gd.sample_input ? `\nSample Input: ${gd.sample_input}` : "",
      gd.sample_output ? `\nSample Output: ${gd.sample_output}` : "",
      gd.hidden_tests ? `\nHidden Tests:\n${JSON.stringify(gd.hidden_tests, null, 2)}` : "",
      correctCode ? `\nCorrect Code (clean_solution):\n\`\`\`python\n${correctCode}\n\`\`\`` : "",
      gd.explanation ? `\nExplanation (post-Hangman):\n${gd.explanation}` : "",
      gd.buggy_code ? `\nBuggy Code (code_shown_to_student):\n\`\`\`python\n${gd.buggy_code}\n\`\`\`` : "",
      gd.buggy_correct_code ? `\nBug-Fixed Code (code_with_bug_fixed):\n\`\`\`python\n${gd.buggy_correct_code}\n\`\`\`` : "",
      gd.buggy_explanation ? `\nBuggy Explanation (post-Debugging):\n${gd.buggy_explanation}` : "",
      `\n\nFlag Notes:\n${item.notes || "N/A"}`,
      `\n\nInstructions for regeneration:\n[Add your specific instructions here - how should this question be improved?]`,
    ];
    return lines.filter(Boolean).join("");
  }

  return [
    `Question to regenerate:\n${item.question}`,
    optionsText,
    item.correct_answer ? `\n\nCorrect Answer: ${item.correct_answer}` : "",
    `\n\nFlag Notes:\n${item.notes || "N/A"}`,
    `\n\nInstructions for regeneration:\n[Add your specific instructions here - how should this question be improved?]`,
  ].join("");
}


// ============================================================
// MAIN COMPONENT
// ============================================================

const FlaggedQuestions = () => {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────
  const [flaggedPage, setFlaggedPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState<FlaggedQuestionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Modal state
  const [selectedQuestion, setSelectedQuestion] = useState<FlaggedQuestionRow | null>(null);
  const [editableQuestion, setEditableQuestion] = useState("");
  const [editableBuggyQuestionText, setEditableBuggyQuestionText] = useState("");
  const [editableFunctionName, setEditableFunctionName] = useState("");
  const [editableSampleInput, setEditableSampleInput] = useState("");
  const [editableSampleOutput, setEditableSampleOutput] = useState("");
  const [editableHiddenTests, setEditableHiddenTests] = useState("");
  const [editableExplanation, setEditableExplanation] = useState("");
  const [editableBuggyCode, setEditableBuggyCode] = useState("");
  const [editableBuggyCorrectCode, setEditableBuggyCorrectCode] = useState("");
  const [editableBuggyExplanation, setEditableBuggyExplanation] = useState("");
  const [editableCorrectCode, setEditableCorrectCode] = useState("");
  const [editableCorrectAnswer, setEditableCorrectAnswer] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetailQuestion, setLoadingDetailQuestion] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [loadingFullQuestion, setLoadingFullQuestion] = useState("");
  const [llmPrompt, setLlmPrompt] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [regeneratePreview, setRegeneratePreview] = useState<RegenerationPreviewResponse | null>(null);
  const [acceptedFields, setAcceptedFields] = useState<string[]>([]);
  const [regenerateError, setRegenerateError] = useState("");
  const [regenerateSuccess, setRegenerateSuccess] = useState("");

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [unflagging, setUnflagging] = useState(false);

  // Filters
  const [filterLevel, setFilterLevel] = useState<UserLevel | "">("");
  const [filterMinCount, setFilterMinCount] = useState<number>(0);

  // ── Data fetching ──────────────────────────────────────────
  // ✅ Now passes filterLevel + filterMinCount to backend, and re-fetches when they change
  useEffect(() => {
    const fetchFlaggedQuestions = async () => {
      setLoading(true);
      setError(null);
      const result = await flagApi.getFlaggedQuestions(
        flaggedPage,
        10,
        filterLevel || undefined,
        filterMinCount || undefined
      );
      if (result) {
        setFlaggedQuestions(
          result.results.map((fq: FlaggedQuestion) => ({
            id: fq.id,
            question: fq.question_text,
            game: fq.game_type,
            flagged_by: fq.flagged_by || "Anonymous",
            notes: fq.flag_notes || null,
            created_at: fq.flag_created_at || null,
            difficulty: fq.estimated_difficulty || "Unknown",
            answer_options: fq.answer_options || null,
            correct_answer: fq.correct_answer || null,
            game_data: fq.game_data || null,
            flag_count_by_level: fq.flag_count_by_level ?? { beginner: 0, intermediate: 0, advanced: 0, master: 0 },
          }))
        );
        setTotal(result.count);
      } else {
        setError("Failed to fetch flagged questions");
        setFlaggedQuestions([]);
      }
      setLoading(false);
    };
    fetchFlaggedQuestions();
  }, [flaggedPage, filterLevel, filterMinCount, refreshKey]); // ✅ re-fetches on filter change

  // ── Modal reset helpers ────────────────────────────────────
  const closeRegenerateModal = () => {
    setShowRegenerateModal(false);
    setRegeneratePreview(null);
    setAcceptedFields([]);
    setRegenerateError("");
    setRegenerateSuccess("");
    setLlmPrompt("");
  };

  // ── Selection handlers ─────────────────────────────────────
  const toggleSelectAll = () => {
    setSelectedIds(
      selectedIds.size === flaggedQuestions.length
        ? new Set()
        : new Set(flaggedQuestions.map((q) => q.id))
    );
  };

  const toggleSelectId = (id: number) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  // ── Event handlers ─────────────────────────────────────────
  const handleOpenDetail = async (item: FlaggedQuestionRow) => {
    setLoadingDetailQuestion(true);
    const fullQuestion = await flagApi.getQuestionById(item.id);
    const fullItem: FlaggedQuestionRow = {
      ...item,
      game_data: fullQuestion?.game_data || item.game_data,
      correct_answer: fullQuestion?.correct_answer || item.correct_answer,
      answer_options:
        fullQuestion?.game_data?.answer_options ||
        fullQuestion?.answer_options ||
        item.answer_options,
    };
    setSelectedQuestion(fullItem);
    setEditableQuestion(fullItem.question);
    if (fullItem.game === "coding") {
      setEditableBuggyQuestionText(fullItem.game_data?.buggy_question_text || "");
      setEditableFunctionName(fullItem.game_data?.function_name || "");
      setEditableSampleInput(fullItem.game_data?.sample_input || "");
      setEditableSampleOutput(fullItem.game_data?.sample_output || "");
      setEditableHiddenTests(JSON.stringify(fullItem.game_data?.hidden_tests ?? [], null, 2));
      setEditableExplanation(fullItem.game_data?.explanation || "");
      setEditableBuggyCode(fullItem.game_data?.buggy_code || (fullItem.game_data as any)?.code_shown_to_student || "");
      setEditableBuggyCorrectCode(fullItem.game_data?.buggy_correct_code || (fullItem.game_data as any)?.code_with_bug_fixed || "");
      setEditableBuggyExplanation(fullItem.game_data?.buggy_explanation || "");
      setEditableCorrectCode(
        fullItem.game_data?.correct_code ||
        (fullItem.game_data as any)?.clean_solution ||
        fullItem.game_data?.solution ||
        fullItem.correct_answer || ""
      );
    } else {
      setEditableCorrectAnswer(fullItem.correct_answer || "");
    }
    setLoadingDetailQuestion(false);
    setShowDetailModal(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedQuestion) return;
    setSaving(true);
    const updateData: Parameters<typeof adminApi.partialUpdateQuestion>[1] = {
      question_text: editableQuestion,
    };
    if (selectedQuestion.game === "coding") {
      let hidden_tests = selectedQuestion.game_data?.hidden_tests ?? [];
      try { hidden_tests = JSON.parse(editableHiddenTests); } catch { /* keep existing */ }
      updateData.game_data = {
        ...(selectedQuestion.game_data as Record<string, unknown>),
        function_name: editableFunctionName,
        correct_code: editableCorrectCode,
        sample_input: editableSampleInput,
        sample_output: editableSampleOutput,
        hidden_tests,
        explanation: editableExplanation,
        buggy_question_text: editableBuggyQuestionText,
        buggy_code: editableBuggyCode,
        buggy_correct_code: editableBuggyCorrectCode,
        buggy_explanation: editableBuggyExplanation,
      };
    } else {
      updateData.correct_answer = editableCorrectAnswer;
    }
    try {
      await adminApi.partialUpdateQuestion(selectedQuestion.id, updateData);
      alert("Question updated successfully");
      setShowDetailModal(false);
      setSelectedQuestion(null);
      setFlaggedPage(1);
      setRefreshKey((k) => k + 1);
    } catch {
      alert("Failed to update question");
    }
    setSaving(false);
  };

  const handleOpenRegenerate = async (item: FlaggedQuestionRow) => {
    setLoadingFullQuestion(item.id.toString());
    const fullQuestion = await flagApi.getQuestionById(item.id);
    const fullItem: FlaggedQuestionRow = {
      ...item,
      game_data: fullQuestion?.game_data || item.game_data,
      correct_answer: fullQuestion?.correct_answer || item.correct_answer,
      answer_options:
        fullQuestion?.game_data?.answer_options ||
        fullQuestion?.answer_options ||
        item.answer_options,
    };
    setSelectedQuestion(fullItem);
    setLlmPrompt(buildInitialPrompt(fullItem));
    setLoadingFullQuestion("");
    setShowRegenerateModal(true);
  };

  const handleRegeneratePreview = async () => {
    if (!selectedQuestion || !llmPrompt.trim()) return;
    setRegenerating(true);
    setRegenerateError("");
    try {
      const result = await adminApi.regenerateQuestion(selectedQuestion.id, { llm_prompt: llmPrompt });
      if (result.status === "preview") {
        setRegeneratePreview(result);
        setAcceptedFields([...result.accepted_fields_available]);
      }
    } catch (err: any) {
      setRegenerateError(err.response?.data?.error || err.message || "Preview failed");
    }
    setRegenerating(false);
  };

  const handleRegenerateApply = async () => {
    if (!selectedQuestion || !regeneratePreview) return;
    setRegenerating(true);
    setRegenerateError("");
    try {
      const result = await adminApi.regenerateQuestion(selectedQuestion.id, {
        llm_prompt: llmPrompt,
        regenerated: regeneratePreview.regenerated,
        accepted_fields: acceptedFields,
      });
      if (result.status === "success") {
        // Automatically unflag the question upon successful apply
        const unflagResult = await flagApi.dismissFlaggedQuestion(selectedQuestion.id);
        
        if (unflagResult) {
          setRegenerateSuccess(`Fields updated on question #${selectedQuestion.id} and question successfully unflagged.`);
          setRegeneratePreview(null);
          // Set refresh key to update the list, the user will click Done to close the modal
          setFlaggedPage(1);
          setRefreshKey((k) => k + 1);
        } else {
          setRegenerateSuccess(`Fields updated on question #${selectedQuestion.id} but failed to unflag automatically.`);
          setRegeneratePreview(null);
          setRefreshKey((k) => k + 1);
        }
      }
    } catch (err: any) {
      setRegenerateError(err.response?.data?.error || err.message || "Apply failed");
    }
    setRegenerating(false);
  };

  const handleUnflagSingle = async () => {
    if (!selectedQuestion) return;
    setUnflagging(true);
    const result = await flagApi.dismissFlaggedQuestion(selectedQuestion.id);
    if (result) {
      alert("Question unflagged successfully");
      setShowDetailModal(false);
      setSelectedQuestion(null);
      setFlaggedPage(1);
      setRefreshKey((k) => k + 1);
    } else {
      alert("Failed to unflag question");
    }
    setUnflagging(false);
  };

  const handleUnflagBulk = async () => {
    if (selectedIds.size === 0) return;
    setUnflagging(true);
    let successCount = 0;
    for (const id of selectedIds) {
      const result = await flagApi.dismissFlaggedQuestion(id);
      if (result) successCount++;
    }
    alert(`Unflagged ${successCount} of ${selectedIds.size} questions`);
    setSelectedIds(new Set());
    setFlaggedPage(1);
    setRefreshKey((k) => k + 1);
    setUnflagging(false);
  };

  // ── Table row renderer ─────────────────────────────────────
  const renderFlaggedRow = (item: FlaggedQuestionRow) => {
    return (
      <tr key={item.id}>
        <td className="px-3 py-3 text-center">
          <input
            type="checkbox"
            checked={selectedIds.has(item.id)}
            onChange={() => toggleSelectId(item.id)}
            className="w-4 h-4 cursor-pointer"
          />
        </td>
        <td className="px-3 py-3 text-sm font-mono text-center">{item.id}</td>
        <td className="px-3 py-3">
          <div className="line-clamp-2 text-sm max-w-[300px]">{item.question}</div>
        </td>
        <td className="px-3 py-3 text-sm">
          {item.notes ? (
            <span className="text-xs text-gray-500 italic line-clamp-2 max-w-[160px]">
              {item.notes}
            </span>
          ) : (
            <span className="text-xs text-gray-300">—</span>
          )}
        </td>
        <td className="px-3 py-3 text-sm text-center">
          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
            {item.game}
          </span>
        </td>
        <td className="px-3 py-3 text-sm text-center">{item.flagged_by}</td>
        <td className="px-3 py-3 text-center">
          <div className="flex justify-center space-x-2">
            <button
              className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
              title="View & Edit Details"
              type="button"
              disabled={loadingDetailQuestion}
              onClick={() => handleOpenDetail(item)}
            >
              <FiEdit2 className={`w-4 h-4 ${loadingDetailQuestion ? "opacity-40" : ""}`} />
            </button>
            <button
              className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
              title="Regenerate Question"
              type="button"
              disabled={loadingFullQuestion === item.id.toString()}
              onClick={() => handleOpenRegenerate(item)}
            >
              {loadingFullQuestion === item.id.toString() ? (
                <FiRefreshCw className="w-4 h-4 animate-spin text-purple-600" />
              ) : (
                <FiRefreshCw className="w-4 h-4" />
              )}
            </button>
          </div>
        </td>
      </tr>
    );
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <BackButton onClick={() => navigate(-1)} />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Filter Bar ── */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <select
          value={filterLevel}
          onChange={(e) => {
            setFilterLevel(e.target.value as UserLevel | "");
            setFilterMinCount(0);
            setFlaggedPage(1);
          }}
          className="rounded-md border border-gray-300 p-2 min-w-[150px]"
        >
          <option value="">All Levels</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>{LEVEL_STYLES[l].label}</option>
          ))}
        </select>

        <input
          type="number"
          min={0}
          value={filterMinCount || ""}
          onChange={(e) => {
            setFilterMinCount(Math.max(0, Number(e.target.value)));
            setFlaggedPage(1);
          }}
          placeholder={filterLevel ? `Min flags (rec. ${THRESHOLDS[filterLevel]}+)` : "Min flags"}
          className="rounded-md border border-gray-300 p-2 min-w-[150px]"
        />

        {(filterLevel || filterMinCount > 0) && (
          <button
            type="button"
            onClick={() => { setFilterLevel(""); setFilterMinCount(0); setFlaggedPage(1); }}
            className="rounded-md border border-gray-300 p-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Bulk Action Bar ── */}
      {selectedIds.size > 0 && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-purple-900">
            {selectedIds.size} question{selectedIds.size !== 1 ? "s" : ""} selected
          </span>
          <button
            type="button"
            onClick={handleUnflagBulk}
            disabled={unflagging}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
              unflagging ? "cursor-not-allowed bg-gray-200 text-gray-400" : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {unflagging ? "Unflagging..." : "Unflag Selected"}
          </button>
        </div>
      )}

      {/* ── Select-all Header ── */}
      {flaggedQuestions.length > 0 && (
        <div className="rounded-t-lg border border-b-0 border-gray-200 bg-gray-50 p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedIds.size === flaggedQuestions.length}
              onChange={toggleSelectAll}
              className="w-4 h-4 cursor-pointer"
            />
            <span className="text-xs font-medium text-gray-600">
              {selectedIds.size === flaggedQuestions.length
                ? "All selected"
                : selectedIds.size > 0
                ? `${selectedIds.size} selected`
                : "Select items"}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {flaggedQuestions.length} question{flaggedQuestions.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* ── Table ── */}
      <AdminTable
        title="Flagged Questions"
        loading={loading}
        items={flaggedQuestions}
        total={total}
        currentPage={flaggedPage}
        onPageChange={setFlaggedPage}
        itemsPerPage={10}
        headerColumns={["", "ID", "Question", "Notes", "Game", "Flagged By", "Actions"]}
        renderRow={renderFlaggedRow}
      />

      {/* ── Detail / Edit Modal ── */}
      {showDetailModal && selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Edit Flagged Question</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  ID: {selectedQuestion.id} &bull;{" "}
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800">{selectedQuestion.game}</span>
                </p>
              </div>
              <button type="button" onClick={() => setShowDetailModal(false)}
                className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-5 flex-1">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Difficulty</label>
                  <p className="mt-1 text-sm capitalize text-gray-800">{selectedQuestion.difficulty}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Flagged By</label>
                  <p className="mt-1 text-sm text-gray-800">{selectedQuestion.flagged_by}</p>
                </div>
                {selectedQuestion.created_at && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Flagged On</label>
                    <p className="mt-1 text-sm text-gray-600">
                      {new Date(selectedQuestion.created_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              {selectedQuestion.notes && (
                <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-gray-800">
                  <span className="text-xs font-semibold text-yellow-700 block mb-1">Flag Notes</span>
                  {selectedQuestion.notes}
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-gray-700">Question Text</label>
                <textarea
                  value={editableQuestion}
                  onChange={(e) => setEditableQuestion(e.target.value)}
                  rows={4}
                  disabled={saving}
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-60"
                />
              </div>
              {selectedQuestion.game === "coding" && (
                <>
                  {/* Normal variant */}
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Normal (Hangman)</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-700">Function Name</label>
                      <input
                        type="text"
                        value={editableFunctionName}
                        onChange={(e) => setEditableFunctionName(e.target.value)}
                        disabled={saving}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-xs font-mono focus:border-blue-400 focus:outline-none disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700">Sample Input</label>
                      <input
                        type="text"
                        value={editableSampleInput}
                        onChange={(e) => setEditableSampleInput(e.target.value)}
                        disabled={saving}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-xs font-mono focus:border-blue-400 focus:outline-none disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700">Sample Output</label>
                      <input
                        type="text"
                        value={editableSampleOutput}
                        onChange={(e) => setEditableSampleOutput(e.target.value)}
                        disabled={saving}
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-xs font-mono focus:border-blue-400 focus:outline-none disabled:opacity-60"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-green-700">Correct Code (clean_solution)</label>
                    <textarea
                      value={editableCorrectCode}
                      onChange={(e) => setEditableCorrectCode(e.target.value)}
                      rows={5}
                      disabled={saving}
                      spellCheck={false}
                      className="mt-2 w-full rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs font-mono focus:border-green-400 focus:outline-none disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Hidden Tests <span className="font-normal text-gray-400">(JSON array)</span></label>
                    <textarea
                      value={editableHiddenTests}
                      onChange={(e) => setEditableHiddenTests(e.target.value)}
                      rows={4}
                      disabled={saving}
                      spellCheck={false}
                      className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-xs font-mono focus:border-blue-400 focus:outline-none disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Explanation <span className="font-normal text-gray-400">(shown after Hangman)</span></label>
                    <textarea
                      value={editableExplanation}
                      onChange={(e) => setEditableExplanation(e.target.value)}
                      rows={3}
                      disabled={saving}
                      className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:border-blue-400 focus:outline-none disabled:opacity-60"
                    />
                  </div>

                  {/* Buggy variant */}
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wide pt-2">Buggy (Debugging)</p>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Buggy Question Text</label>
                    <textarea
                      value={editableBuggyQuestionText}
                      onChange={(e) => setEditableBuggyQuestionText(e.target.value)}
                      rows={2}
                      disabled={saving}
                      className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:border-red-400 focus:outline-none disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-red-700">Buggy Code (code_shown_to_student)</label>
                    <textarea
                      value={editableBuggyCode}
                      onChange={(e) => setEditableBuggyCode(e.target.value)}
                      rows={5}
                      disabled={saving}
                      spellCheck={false}
                      className="mt-2 w-full rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-mono focus:border-red-400 focus:outline-none disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-green-700">Bug-Fixed Code (code_with_bug_fixed)</label>
                    <textarea
                      value={editableBuggyCorrectCode}
                      onChange={(e) => setEditableBuggyCorrectCode(e.target.value)}
                      rows={5}
                      disabled={saving}
                      spellCheck={false}
                      className="mt-2 w-full rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs font-mono focus:border-green-400 focus:outline-none disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Buggy Explanation <span className="font-normal text-gray-400">(shown after Debugging)</span></label>
                    <textarea
                      value={editableBuggyExplanation}
                      onChange={(e) => setEditableBuggyExplanation(e.target.value)}
                      rows={3}
                      disabled={saving}
                      className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:border-red-400 focus:outline-none disabled:opacity-60"
                    />
                  </div>
                </>
              )}
              {selectedQuestion.game !== "coding" && (
                <div>
                  <label className="text-xs font-semibold text-green-700">Correct Answer</label>
                  <input
                    type="text"
                    value={editableCorrectAnswer}
                    onChange={(e) => setEditableCorrectAnswer(e.target.value)}
                    disabled={saving}
                    className="mt-2 w-full rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm focus:border-green-400 focus:outline-none disabled:opacity-60"
                  />
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex items-center justify-between gap-2">
              <button type="button" onClick={handleUnflagSingle} disabled={unflagging || saving}
                className={`px-3 py-2 text-xs font-semibold rounded-md transition ${
                  unflagging || saving ? "cursor-not-allowed bg-gray-200 text-gray-400" : "bg-red-600 text-white hover:bg-red-700"
                }`}>
                {unflagging ? "Unflagging..." : "Unflag This Question"}
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowDetailModal(false)} disabled={saving}
                  className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  Cancel
                </button>
                <button type="button" onClick={handleSaveChanges} disabled={saving || unflagging}
                  className={`rounded-md px-3 py-2 text-xs font-semibold transition ${
                    saving || unflagging ? "cursor-not-allowed bg-gray-200 text-gray-400" : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Regenerate Modal ── */}
      {showRegenerateModal && selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-5xl rounded-lg bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Regenerate Question</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  ID: {selectedQuestion.id} · <span className="capitalize">{selectedQuestion.game}</span>
                </p>
              </div>
              <button type="button" onClick={closeRegenerateModal} disabled={regenerating}
                className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Prompt */}
              {!regenerateSuccess && (
                <div>
                  <label className="text-xs font-semibold text-gray-700">LLM Regeneration Prompt (Editable)</label>
                  <textarea
                    value={llmPrompt}
                    onChange={(e) => setLlmPrompt(e.target.value)}
                    rows={6}
                    disabled={regenerating}
                    className="mt-2 w-full rounded-md border border-purple-200 px-3 py-2 text-xs bg-purple-50 focus:border-purple-500 focus:outline-none disabled:opacity-50 font-mono"
                  />
                </div>
              )}

              {regenerateError && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3 text-xs text-red-700">{regenerateError}</div>
              )}

              {regenerateSuccess && (
                <div className="rounded-md bg-green-50 border border-green-200 p-4 space-y-3">
                  <p className="text-xs text-green-800 font-medium">{regenerateSuccess}</p>
                  <div className="flex justify-end">
                    <button type="button" onClick={() => {
                        closeRegenerateModal();
                        if (regenerateSuccess.includes("unflagged")) {
                          setShowDetailModal(false);
                          setSelectedQuestion(null);
                        }
                      }}
                      className="rounded-md bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700">
                      Done
                    </button>
                  </div>
                </div>
              )}

              {/* Step 1: no preview yet */}
              {!regeneratePreview && !regenerateSuccess && (
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={closeRegenerateModal} disabled={regenerating}
                    className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                    Cancel
                  </button>
                  <button type="button" onClick={handleRegeneratePreview}
                    disabled={!llmPrompt.trim() || regenerating}
                    className={`rounded-md px-3 py-2 text-xs font-semibold transition ${
                      llmPrompt.trim() && !regenerating
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "cursor-not-allowed bg-gray-200 text-gray-400"
                    }`}>
                    {regenerating ? "Generating Preview..." : "Generate Preview"}
                  </button>
                </div>
              )}

              {/* Step 2: preview table */}
              {regeneratePreview && !regenerateSuccess && (
                <>
                  <p className="text-xs text-gray-500">Check the fields you want to apply. Uncheck any you want to keep as-is.</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left px-3 py-2 border border-gray-200 w-8">Apply</th>
                          <th className="text-left px-3 py-2 border border-gray-200 w-36">Field</th>
                          <th className="text-left px-3 py-2 border border-gray-200">Current</th>
                          <th className="text-left px-3 py-2 border border-gray-200">Regenerated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {regeneratePreview.accepted_fields_available.map((field) => {
                          const labelMap: Record<string, string> = {
                            question_text: "Question Text",
                            buggy_question_text: "Buggy Question Text",
                            explanation: "Explanation",
                            buggy_explanation: "Buggy Explanation",
                            function_name: "Function Name",
                            sample_input: "Sample Input",
                            sample_output: "Sample Output",
                            hidden_tests: "Hidden Tests",
                            buggy_code: "Buggy Code",
                            correct_code: "Correct Code",
                            buggy_correct_code: "Buggy Correct Code",
                            difficulty: "Difficulty",
                            answer: "Answer",
                          };
                          const currentVal = regeneratePreview.current[field];
                          const regenVal = regeneratePreview.regenerated[field];
                          const displayVal = (v: any) =>
                            v == null ? <span className="text-gray-400 italic">—</span>
                            : typeof v === "object" ? <pre className="whitespace-pre-wrap font-mono">{JSON.stringify(v, null, 2)}</pre>
                            : <span className="whitespace-pre-wrap">{String(v)}</span>;
                          const isCode = ["buggy_code", "correct_code", "buggy_correct_code"].includes(field);
                          const changed = JSON.stringify(currentVal) !== JSON.stringify(regenVal);
                          return (
                            <tr key={field} className={changed ? "bg-yellow-50" : ""}>
                              <td className="px-3 py-2 border border-gray-200 text-center">
                                <input
                                  type="checkbox"
                                  checked={acceptedFields.includes(field)}
                                  onChange={(e) =>
                                    setAcceptedFields((prev) =>
                                      e.target.checked ? [...prev, field] : prev.filter((f) => f !== field)
                                    )
                                  }
                                  className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-3 py-2 border border-gray-200 font-medium text-gray-700 align-top">
                                {labelMap[field] ?? field}
                              </td>
                              <td className={`px-3 py-2 border border-gray-200 align-top max-w-xs ${isCode ? "font-mono bg-gray-50" : ""}`}>
                                {displayVal(currentVal)}
                              </td>
                              <td className={`px-3 py-2 border border-gray-200 align-top max-w-xs ${isCode ? "font-mono bg-gray-50" : ""} ${changed ? "text-purple-800" : ""}`}>
                                {displayVal(regenVal)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200">
                    <button type="button" onClick={handleRegeneratePreview} disabled={!llmPrompt.trim() || regenerating}
                      className="rounded-md border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50">
                      {regenerating ? "Generating..." : "← Re-generate Preview"}
                    </button>
                    <div className="flex gap-2">
                      <button type="button" onClick={closeRegenerateModal}
                        className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                        Discard
                      </button>
                      <button type="button" onClick={handleRegenerateApply}
                        disabled={regenerating || acceptedFields.length === 0}
                        className={`rounded-md px-3 py-2 text-xs font-semibold transition ${
                          !regenerating && acceptedFields.length > 0
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "cursor-not-allowed bg-gray-200 text-gray-400"
                        }`}>
                        {regenerating ? "Applying..." : `✓ Apply ${acceptedFields.length} Field${acceptedFields.length !== 1 ? "s" : ""}`}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlaggedQuestions;