import { useAllCabsList } from "@/utils/apis";
import { CbEntry, RateCardEntry, StandardsMultiSelect } from "./ba-form";
import { Plus, Trash2, X } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@base-ui/react";


export function CbRateCardSection({
    cbEntries,
    onChange,
    error,
}: {
    cbEntries: CbEntry[];
    onChange: (entries: CbEntry[]) => void;
    error?: string | null;
}) {
    const { cabs, isLoading: loadingCabs } = useAllCabsList();

    const addCbEntry = () => {
        onChange([
            ...cbEntries,
            { cabCode: "", cbCode: "", abCode: "", status: "active", standards: [] },
        ]);
    };

    const removeCbEntry = (index: number) => {
        onChange(cbEntries.filter((_, i) => i !== index));
    };

    const handleCabSelect = (index: number, cabId: string) => {
        const cab = cabs.find((c: any) => c._id === cabId);
        if (!cab) return;

        const updated = [...cbEntries];
        updated[index] = {
            cabCode: cab.cabCode,
            cbCode: cab.cbCode,
            abCode: cab.abCode,
            status: "active",
            standards: [],
        };
        onChange(updated);
    };

    const getStandardsForCab = (cbEntry: CbEntry) => {
        const cab = cabs.find(
            (c: any) => c.cabCode === cbEntry.cabCode && c.cbCode === cbEntry.cbCode,
        );
        return cab?.standards || [];
    };

    const toggleStandard = (cbIndex: number, standard: any) => {
        const entry = cbEntries[cbIndex];
        if (!entry) return;

        const updated = [...cbEntries];
        const existing = entry.standards;
        const alreadyIndex = existing.findIndex(
            (s) => s.code === standard.mssCode,
        );

        if (alreadyIndex >= 0) {
            // Remove
            updated[cbIndex] = {
                ...entry,
                standards: existing.filter((_, i) => i !== alreadyIndex),
            };
        } else {
            // Add
            updated[cbIndex] = {
                ...entry,
                standards: [
                    ...existing,
                    {
                        name: standard.schemeName,
                        code: `${standard.standardCode}:${standard.version}`,
                        version: 0,
                        status: "active",
                        rateCard: [
                            {
                                initial: "0",
                                annual: "0",
                                recertification: "0",
                                startDate: "",
                                status: "pending",
                            },
                        ],
                    },
                ],
            };
        }
        onChange(updated);
    };

    const removeStandard = (cbIndex: number, stdIndex: number) => {
        const updated = [...cbEntries];
        const entry = updated[cbIndex]!;
        updated[cbIndex] = {
            ...entry,
            standards: entry.standards.filter((_, i) => i !== stdIndex),
        };
        onChange(updated);
    };

    const updateRateCard = (
        cbIndex: number,
        stdIndex: number,
        field: keyof RateCardEntry,
        value: string,
    ) => {
        if (["initial", "annual", "recertification"].includes(field)) {
            const num = Number(value);
            if (num < 0) return;
        }

        const updated = [...cbEntries];
        const entry = updated[cbIndex]!;
        const std = entry.standards[stdIndex]!;
        const rateCard = { ...std.rateCard[0]! };
        rateCard[field] = value;
        updated[cbIndex] = {
            ...entry,
            standards: entry.standards.map((s, i) =>
                i === stdIndex ? { ...s, rateCard: [rateCard] } : s,
            ),
        };
        onChange(updated);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                    Certification Bodies & Rate Cards
                </h3>
                <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={addCbEntry}
                >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Rate Card
                </Button>
            </div>

            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}

            {cbEntries.map((cb, cbIndex) => {
                const selectedCab = cabs.find(
                    (c: any) =>
                        c.cabCode === cb.cabCode && c.cbCode === cb.cbCode,
                );
                const availableStandards = getStandardsForCab(cb);

                return (
                    <div key={cbIndex} className="rounded-lg border p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                                Rate Card #{cbIndex + 1}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCbEntry(cbIndex)}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Select CAB */}
                        <div>
                            <label className="text-sm font-medium">
                                Select Certification - Accreditation Body (CAB code)
                            </label>
                            <Select
                                value={selectedCab?._id || ""}
                                onValueChange={(val) => handleCabSelect(cbIndex, val)}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue
                                        placeholder={
                                            loadingCabs ? "Loading..." : "Select CAB"
                                        }
                                    >
                                        {(value: string | null) => {
                                            if (!value)
                                                return loadingCabs ? "Loading..." : "Select CAB";
                                            const c = cabs.find((cab: any) => cab._id === value);
                                            return c
                                                ? `${c.cabCode} - ${c.cbCode} - ${c.abCode}`
                                                : "Select CAB";
                                        }}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {cabs.map((c: any) => (
                                        <SelectItem key={c._id} value={c._id}>
                                            {c.cabCode} - {c.cbCode} - {c.abCode}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Select Standards (multi-select) */}
                        {cb.cabCode && (
                            <div>
                                <label className="text-sm font-medium">Select Standards</label>
                                <StandardsMultiSelect
                                    availableStandards={availableStandards}
                                    selectedCodes={cb.standards.map((s) => s.code)}
                                    onToggle={(std) => toggleStandard(cbIndex, std)}
                                />
                            </div>
                        )}

                        {/* Rate Cards Table */}
                        {cb.standards.length > 0 && (
                            <div>
                                <label className="text-sm font-medium">Rate Cards</label>
                                <div className="mt-2 rounded-md border overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="px-3 py-2 text-left font-medium">
                                                    Standards Code
                                                </th>
                                                <th className="px-3 py-2 text-left font-medium">
                                                    Initial
                                                </th>
                                                <th className="px-3 py-2 text-left font-medium">
                                                    Annual
                                                </th>
                                                <th className="px-3 py-2 text-left font-medium">
                                                    3 Year Fee
                                                </th>
                                                <th className="px-3 py-2 text-left font-medium">
                                                    Start Date
                                                </th>
                                                <th className="px-3 py-2 text-left font-medium"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cb.standards.map((std, stdIndex) => (
                                                <tr key={stdIndex} className="border-b last:border-0">
                                                    <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">
                                                        {std.code}{' '}
                                                        <span className="inline-block max-w-[150px] truncate align-middle">
                                                            {std.name}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max={99999}
                                                            maxLength={5}
                                                            value={std.rateCard[0]?.initial || ""}
                                                            onChange={(e) => {
                                                                if (e.target.value.length > 5) return;
                                                                updateRateCard(
                                                                    cbIndex,
                                                                    stdIndex,
                                                                    "initial",
                                                                    e.target.value,
                                                                );
                                                            }}
                                                            className="h-8 w-24"
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max={99999}
                                                            maxLength={5}
                                                            value={std.rateCard[0]?.annual || ""}
                                                            onChange={(e) => {
                                                                if (e.target.value.length > 5) return;
                                                                updateRateCard(
                                                                    cbIndex,
                                                                    stdIndex,
                                                                    "annual",
                                                                    e.target.value,
                                                                );
                                                            }}
                                                            className="h-8 w-24"
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max={99999}
                                                            maxLength={5}
                                                            value={std.rateCard[0]?.recertification || ""}
                                                            onChange={(e) => {
                                                                if (e.target.value.length > 5) return;
                                                                updateRateCard(
                                                                    cbIndex,
                                                                    stdIndex,
                                                                    "recertification",
                                                                    e.target.value,
                                                                );
                                                            }}
                                                            className="h-8 w-24"
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            type="date"
                                                            value={std.rateCard[0]?.startDate || ""}
                                                            onChange={(e) =>
                                                                updateRateCard(
                                                                    cbIndex,
                                                                    stdIndex,
                                                                    "startDate",
                                                                    e.target.value,
                                                                )
                                                            }
                                                            className="h-8 w-36"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeStandard(cbIndex, stdIndex)}
                                                            className="text-muted-foreground hover:text-destructive"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
