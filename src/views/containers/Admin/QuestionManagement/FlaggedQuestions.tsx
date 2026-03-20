import { useState, useEffect } from "react";
import { AdminTable } from "../../../components/UI";
import { FiEdit2, FiRefreshCw, FiX } from "react-icons/fi";
import flagApi, { type FlaggedQuestion } from "../../../../api/flagApi";

// ============================================================
// TYPES
// ============================================================

type FlaggedQuestionRow = {
  id: number;
  question: string;
  reason: string;
  game: string;
  flagged_by: string;
  notes: string | null;
  created_at: string | null;
  difficulty: string;
  answer_options?: Record<string, string> | null;
  correct_answer?: string | null;
  game_data?: Record<string, any> | null;
};

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

function buildCodeText(item: FlaggedQuestionRow): { buggyCodeText: string; correctCodeText: string } {
  if (item.game === "coding") {
    const buggyCodeText = item.game_data?.buggy_code
      ? `\n\nBuggy Code:\n\`\`\`python\n${item.game_data.buggy_code}\n\`\`\``
      : "";
    const correctCode =
      item.game_data?.correct_code || item.game_data?.solution || item.correct_answer;
    const correctCodeText = correctCode
      ? `\n\nCorrect Code/Solution:\n\`\`\`python\n${correctCode}\n\`\`\``
      : "";
    return { buggyCodeText, correctCodeText };
  }
  return {
    buggyCodeText: "",
    correctCodeText: item.correct_answer ? `\n\nCorrect Answer: ${item.correct_answer}` : "",
  };
}

function buildInitialPrompt(item: FlaggedQuestionRow): string {
  const optionsText = buildOptionsText(item.answer_options);
  const { buggyCodeText, correctCodeText } = buildCodeText(item);
  return [
    `Reason for flagging: ${item.reason}`,
    `\n\nQuestion to regenerate:\n${item.question}`,
    optionsText,
    buggyCodeText,
    correctCodeText,
    `\n\nAdditional context from user:\n${item.notes || "N/A"}`,
    `\n\nInstructions for regeneration:\n[Add your specific instructions here - how should this question be improved?]`,
  ].join("");
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function QuestionContent({
  game,
  game_data,
  answer_options,
  correct_answer,
}: Pick<FlaggedQuestionRow, "game" | "game_data" | "answer_options" | "correct_answer">) {
  return (
    <>
      {answer_options && (
        <div className="mt-2 text-xs">
          <strong>Options:</strong>
          <pre className="mt-1 bg-gray-50 p-1 rounded border border-gray-100 whitespace-pre-wrap font-sans">
            {typeof answer_options === "string"
              ? answer_options
              : JSON.stringify(answer_options, null, 2)}
          </pre>
        </div>
      )}
      {game === "coding" && game_data?.buggy_code && (
        <div className="mt-2 text-xs text-red-700">
          <strong>Buggy Code:</strong>
          <pre className="mt-1 bg-red-50 p-1 rounded border border-red-100 whitespace-pre-wrap font-mono text-[10px]">
            {game_data.buggy_code}
          </pre>
        </div>
      )}
      {game === "coding" ? (
        (game_data?.correct_code || game_data?.solution || correct_answer) && (
          <div className="mt-2 text-xs text-green-700">
            <strong>Correct Code:</strong>
            <pre className="mt-1 bg-green-50 p-1 rounded border border-green-100 whitespace-pre-wrap font-mono text-[10px]">
              {game_data?.correct_code || game_data?.solution || correct_answer}
            </pre>
          </div>
        )
      ) : (
        correct_answer && (
          <div className="mt-2 text-xs text-green-700">
            <strong>Correct Answer:</strong> {correct_answer}
          </div>
        )
      )}
    </>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

const FlaggedQuestions = () => {

  // ── State ──────────────────────────────────────────────────
  const [flaggedPage, setFlaggedPage] = useState(1);
  const [flaggedQuestions, setFlaggedQuestions] = useState<FlaggedQuestionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Modal state
  const [selectedQuestion, setSelectedQuestion] = useState<FlaggedQuestionRow | null>(null);
  const [editableQuestion, setEditableQuestion] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [loadingFullQuestion, setLoadingFullQuestion] = useState("");
  const [llmPrompt, setLlmPrompt] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [regeneratedQuestion, setRegeneratedQuestion] = useState<FlaggedQuestion | null>(null);
  const [regenerationStep, setRegenerationStep] = useState<"prompt" | "comparing">("prompt");

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [unflagging, setUnflagging] = useState(false);

  // ── Data fetching ──────────────────────────────────────────
  useEffect(() => {
    const fetchFlaggedQuestions = async () => {
      setLoading(true);
      setError(null);
      const result = await flagApi.getFlaggedQuestions(flaggedPage, 10);
      if (result) {
        setFlaggedQuestions(
          result.results.map((fq: FlaggedQuestion) => ({
            id: fq.id,
            question: fq.question_text,
            reason: fq.flag_reason || "Unknown",
            game: fq.game_type,
            flagged_by: fq.flagged_by || "Anonymous",
            notes: fq.flag_notes || null,
            created_at: fq.flag_created_at || null,
            difficulty: fq.estimated_difficulty || "Unknown",
            answer_options: fq.answer_options || null,
            correct_answer: fq.correct_answer || null,
            game_data: fq.game_data || null,
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
  }, [flaggedPage]);

  // ── Modal reset helpers ────────────────────────────────────
  const closeRegenerateModal = () => {
    setShowRegenerateModal(false);
    setRegeneratedQuestion(null);
    setRegenerationStep("prompt");
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
  const handleOpenRegenerate = async (item: FlaggedQuestionRow) => {
    setLoadingFullQuestion(item.id.toString());
    // getQuestionById already returns FlaggedQuestion directly (unwrapped in flagApi)
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

  const handleRegenerateQuestion = async () => {
    if (!selectedQuestion || !llmPrompt.trim()) return;
    setRegenerating(true);
    const result = await flagApi.regenerateQuestion(selectedQuestion.id, llmPrompt);
    if (result?.regenerated_question_id) {
      const newQuestion = await flagApi.getQuestionById(result.regenerated_question_id);
      if (newQuestion) {
        setRegeneratedQuestion(newQuestion);
        setRegenerationStep("comparing");
      } else {
        alert("Regeneration succeeded but could not fetch new question details");
      }
    } else {
      alert("Failed to regenerate question");
    }
    setRegenerating(false);
  };

  const handleAcceptRegeneration = () => {
    if (!regeneratedQuestion) return;
    closeRegenerateModal();
    setFlaggedPage(1);
    alert(`Question (ID: ${regeneratedQuestion.id}) queued for regeneration. Original unflagged.`);
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
    setUnflagging(false);
  };

  // ── Table row renderer ─────────────────────────────────────
  const renderFlaggedRow = (item: FlaggedQuestionRow) => (
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
        <div className="line-clamp-2 text-sm max-w-[400px]">{item.question}</div>
      </td>
      <td className="px-3 py-3 text-sm text-center">
        <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
          {item.reason}
        </span>
      </td>
      <td className="px-3 py-3 text-sm">
        {item.notes ? (
          <span className="text-xs text-gray-500 italic line-clamp-2 max-w-[200px]">
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
            title="View Details"
            type="button"
            onClick={() => {
              setSelectedQuestion(item);
              setEditableQuestion(item.question);
              setShowDetailModal(true);
            }}
          >
            <FiEdit2 className="w-4 h-4" />
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

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

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
        headerColumns={["", "ID", "Question", "Reason", "Notes", "Game", "Flagged By", "Actions"]}
        renderRow={renderFlaggedRow}
      />

      {/* ── Detail Modal ── */}
      {showDetailModal && selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Flagged Question Details</h3>
              <button type="button" onClick={() => setShowDetailModal(false)}
                className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Question ID</label>
                  <p className="mt-1 text-sm font-mono text-gray-900">{selectedQuestion.id}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Game Type</label>
                  <p className="mt-1">
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {selectedQuestion.game}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Difficulty</label>
                  <p className="mt-1 text-sm capitalize text-gray-700">{selectedQuestion.difficulty}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Flagged By</label>
                  <p className="mt-1 text-sm text-gray-700">{selectedQuestion.flagged_by}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Question (Editable)</label>
                <textarea
                  value={editableQuestion}
                  onChange={(e) => setEditableQuestion(e.target.value)}
                  rows={5}
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Flag Reason</label>
                <p className="mt-1">
                  <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                    {selectedQuestion.reason}
                  </span>
                </p>
              </div>

              {selectedQuestion.notes && (
                <div>
                  <label className="text-xs font-semibold text-gray-700">Notes</label>
                  <div className="mt-2 rounded-md border border-gray-200 bg-yellow-50 p-3 text-sm text-gray-900">
                    {selectedQuestion.notes}
                  </div>
                </div>
              )}

              {selectedQuestion.created_at && (
                <div>
                  <label className="text-xs font-semibold text-gray-700">Flagged On</label>
                  <p className="mt-1 text-sm text-gray-600">
                    {new Date(selectedQuestion.created_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between gap-2">
              <button type="button" onClick={handleUnflagSingle} disabled={unflagging}
                className={`px-3 py-2 text-xs font-semibold rounded-md transition ${
                  unflagging ? "cursor-not-allowed bg-gray-200 text-gray-400" : "bg-red-600 text-white hover:bg-red-700"
                }`}>
                {unflagging ? "Unflagging..." : "Unflag This Question"}
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowDetailModal(false)}
                  className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                  Close
                </button>
                <button type="button"
                  onClick={() => {
                    console.log("Saving question changes:", editableQuestion);
                    alert("Changes saved (not yet connected to API)");
                    setShowDetailModal(false);
                  }}
                  className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Regenerate Modal ── */}
      {showRegenerateModal && selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-4xl rounded-lg bg-white shadow-xl max-h-[90vh] overflow-y-auto">

            {/* Prompt Step */}
            {regenerationStep === "prompt" && (
              <>
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Regenerate Question</h3>
                  <button type="button" onClick={closeRegenerateModal} disabled={regenerating}
                    className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-700">Question ID</label>
                      <p className="mt-1 text-sm font-mono text-gray-900">{selectedQuestion.id}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700">Game Type</label>
                      <p className="mt-1 text-sm capitalize text-gray-700">{selectedQuestion.game}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">
                      LLM Regeneration Prompt (Editable)
                    </label>
                    <textarea
                      value={llmPrompt}
                      onChange={(e) => setLlmPrompt(e.target.value)}
                      rows={8}
                      disabled={regenerating}
                      className="mt-2 w-full rounded-md border border-purple-200 px-3 py-2 text-xs bg-purple-50 focus:border-purple-500 focus:outline-none disabled:opacity-50 font-mono"
                    />
                  </div>
                  <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
                    <p className="text-xs text-blue-800">
                      💡 Edit the prompt above to customize how the question should be regenerated.
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-4">
                    <button type="button" onClick={closeRegenerateModal} disabled={regenerating}
                      className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                      Cancel
                    </button>
                    <button type="button" onClick={handleRegenerateQuestion}
                      disabled={!llmPrompt.trim() || regenerating}
                      className={`rounded-md px-3 py-2 text-xs font-semibold transition ${
                        llmPrompt.trim() && !regenerating
                          ? "bg-purple-600 text-white hover:bg-purple-700"
                          : "cursor-not-allowed bg-gray-200 text-gray-400"
                      }`}>
                      {regenerating ? "Regenerating..." : "Regenerate Question"}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Comparison Step */}
            {regenerationStep === "comparing" && regeneratedQuestion && (
              <>
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Question Comparison</h3>
                  <button type="button" onClick={closeRegenerateModal} disabled={regenerating}
                    className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">

                    {/* Original */}
                    <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                      <h4 className="text-xs font-bold text-orange-900 mb-3">ORIGINAL QUESTION</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-orange-700">Question ID</label>
                          <p className="mt-1 text-sm font-mono text-gray-900">{selectedQuestion.id}</p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-orange-700">Question Text</label>
                          <div className="mt-1 text-sm bg-white p-2 rounded border border-orange-100 max-h-[200px] overflow-y-auto">
                            <p>{selectedQuestion.question}</p>
                            <QuestionContent
                              game={selectedQuestion.game}
                              game_data={selectedQuestion.game_data}
                              answer_options={selectedQuestion.answer_options}
                              correct_answer={selectedQuestion.correct_answer}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-orange-700">Flag Reason</label>
                          <p className="mt-1 text-xs text-gray-700">{selectedQuestion.reason}</p>
                        </div>
                        {selectedQuestion.notes && (
                          <div>
                            <label className="text-xs font-semibold text-orange-700">Notes</label>
                            <p className="mt-1 text-xs italic text-gray-600 bg-white p-2 rounded">
                              {selectedQuestion.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Regenerated */}
                    <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                      <h4 className="text-xs font-bold text-green-900 mb-3">REGENERATED QUESTION</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-green-700">Question ID</label>
                          <p className="mt-1 text-sm font-mono text-gray-900">{regeneratedQuestion.id}</p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-green-700">Question Text</label>
                          <div className="mt-1 text-sm bg-white p-2 rounded border border-green-100 max-h-[200px] overflow-y-auto">
                            <p>{regeneratedQuestion.question_text}</p>
                            <QuestionContent
                              game={regeneratedQuestion.game_type}
                              game_data={regeneratedQuestion.game_data}
                              answer_options={regeneratedQuestion.answer_options}
                              correct_answer={regeneratedQuestion.correct_answer}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-green-700">Difficulty</label>
                          <p className="mt-1 text-xs capitalize text-gray-700">
                            {regeneratedQuestion.estimated_difficulty}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-green-700">Status</label>
                          <p className="mt-1 text-xs text-gray-700">pending_regeneration</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
                    <p className="text-xs text-blue-800 font-semibold mb-1">Regeneration Details:</p>
                    <p className="text-xs text-blue-700">
                      Review both versions and decide whether to accept or refine further.
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-200">
                    <button type="button"
                      onClick={() => { setRegeneratedQuestion(null); setRegenerationStep("prompt"); }}
                      className="rounded-md border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100">
                      ← Regenerate Again
                    </button>
                    <div className="flex gap-2">
                      <button type="button" onClick={closeRegenerateModal}
                        className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                        Discard
                      </button>
                      <button type="button" onClick={handleAcceptRegeneration}
                        className="rounded-md bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700">
                        ✓ Accept Regenerated
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlaggedQuestions;