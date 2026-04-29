import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SpeakerMetrics } from "../../types";

interface Props {
  metrics: SpeakerMetrics[];
}

type SortKey = "name" | "totalMs" | "turns" | "longestMs" | "talkRatio";

function fmtMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

export default function SummaryTable({ metrics }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("totalMs");
  const [asc, setAsc] = useState(false);

  const sorted = [...metrics].sort((a, b) => {
    if (sortKey === "name") {
      return asc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
    const av = a[sortKey] as number;
    const bv = b[sortKey] as number;
    return asc ? av - bv : bv - av;
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setAsc((prev) => !prev);
    else {
      setSortKey(key);
      setAsc(false);
    }
  }

  function SortHead({ k, label }: { k: SortKey; label: string }) {
    return (
      <TableHead
        className="cursor-pointer select-none hover:text-foreground transition-colors"
        onClick={() => toggleSort(k)}
      >
        {label}
        {sortKey === k && <span className="ml-1">{asc ? "↑" : "↓"}</span>}
      </TableHead>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Final stats
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHead k="name" label="Speaker" />
              <SortHead k="totalMs" label="Talk time" />
              <SortHead k="turns" label="Turns" />
              <SortHead k="longestMs" label="Longest" />
              <SortHead k="talkRatio" label="Share" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell>{fmtMs(m.totalMs)}</TableCell>
                <TableCell>{m.turns}</TableCell>
                <TableCell>{fmtMs(m.longestMs)}</TableCell>
                <TableCell>{(m.talkRatio * 100).toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
