import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, AreaChart as AreaChartIcon, Table as TableIcon, Columns2, Sparkles, TrendingUp, Info, Check, Copy } from 'lucide-react';
import { VisualisasiGrafik, ChartType } from '../types';
import { useTheme } from '../context/ThemeContext';

interface DataChartViewerProps {
  grafikData?: VisualisasiGrafik;
  tabelData?: {
    headers: string[];
    baris: string[][];
  };
  judulKasus?: string;
  allowToggleView?: boolean;
  defaultView?: 'split' | 'chart' | 'table';
  interactive?: boolean;
  isPrintMode?: boolean;
  className?: string;
  onCiteData?: (citationText: string) => void;
}

const PALETTE = [
  '#10b981', // emerald
  '#0284c7', // sky
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ef4444', // rose
  '#06b6d4', // cyan
  '#ec4899', // pink
];

// Helper to extract numeric value from string (e.g. "52 botol" -> 52, "Rp3.000" -> 3000, "34.8°C" -> 34.8)
function parseNumber(raw: any): number | null {
  if (typeof raw === 'number') return isNaN(raw) ? null : raw;
  if (!raw || typeof raw !== 'string') return null;
  // Clean string: replace Indonesian thousand separator dots if followed by 3 digits, or commas
  const cleaned = raw.trim();
  // Match first floating number pattern
  const match = cleaned.replace(/\./g, '').replace(/,/g, '.').match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const val = parseFloat(match[0]);
  return isNaN(val) ? null : val;
}

export function autoExtractGrafikFromTable(
  tabelData: { headers: string[]; baris: string[][] },
  fallbackTitle?: string
): VisualisasiGrafik | null {
  if (!tabelData || !tabelData.headers || tabelData.headers.length < 2 || !tabelData.baris || tabelData.baris.length === 0) {
    return null;
  }

  const { headers, baris } = tabelData;
  const labelColIdx = 0; // First column as label (e.g. Hari, Bulan, Faktor)
  const labels: string[] = [];

  // Identify numeric columns
  const numericColIndices: number[] = [];
  for (let c = 1; c < headers.length; c++) {
    let numericCount = 0;
    for (let r = 0; r < baris.length; r++) {
      if (parseNumber(baris[r]?.[c]) !== null) {
        numericCount++;
      }
    }
    // If at least 50% of the rows have numbers, treat as numeric column
    if (numericCount >= Math.max(1, Math.floor(baris.length * 0.5))) {
      numericColIndices.push(c);
    }
  }

  if (numericColIndices.length === 0) {
    return null;
  }

  for (let r = 0; r < baris.length; r++) {
    labels.push(baris[r]?.[labelColIdx] || `Data ${r + 1}`);
  }

  const datasets = numericColIndices.map((colIdx, idx) => {
    const colHeader = headers[colIdx] || `Variabel ${idx + 1}`;
    const values = baris.map(r => parseNumber(r?.[colIdx]) ?? 0);
    return {
      nama: colHeader,
      nilai: values,
      warna: PALETTE[idx % PALETTE.length]
    };
  });

  // Decide best chart type
  const isTimeTrend = labels.some(l => {
    const lower = l.toLowerCase();
    return ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu', 'jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des', 'bulan', 'minggu', 'hari'].some(kw => lower.includes(kw));
  });

  const tipeGrafik: ChartType = isTimeTrend ? 'line' : 'bar';

  return {
    tipeGrafik,
    judulGrafik: fallbackTitle || `Grafik Analisis ${headers[numericColIndices[0]] || 'Data Kasus'}`,
    sumbuX: headers[labelColIdx] || 'Kategori / Waktu',
    sumbuY: headers[numericColIndices[0]] || 'Nilai',
    labels,
    datasets,
    deskripsiGrafik: 'Grafik dihasilkan otomatis dari data nyata kasus untuk mempermudah analisis tren dan perbandingan.'
  };
}

export const DataChartViewer: React.FC<DataChartViewerProps> = ({
  grafikData: propGrafikData,
  tabelData,
  judulKasus = 'Kasus Data Nyata',
  allowToggleView = true,
  defaultView = 'split',
  interactive = true,
  isPrintMode = false,
  className = '',
  onCiteData
}) => {
  const { isDarkMode } = useTheme();

  // Resolved graphic data: either prop or extracted from table
  const resolvedGrafik = useMemo(() => {
    if (propGrafikData && propGrafikData.datasets && propGrafikData.datasets.length > 0) {
      return propGrafikData;
    }
    if (tabelData) {
      return autoExtractGrafikFromTable(tabelData, `Visualisasi Data: ${judulKasus}`);
    }
    return null;
  }, [propGrafikData, tabelData, judulKasus]);

  const [activeChartType, setActiveChartType] = useState<ChartType>(() => {
    return resolvedGrafik?.tipeGrafik || 'bar';
  });

  const [viewMode, setViewMode] = useState<'chart' | 'table' | 'split'>(() => {
    if (isPrintMode) return 'split';
    if (!resolvedGrafik && tabelData) return 'table';
    if (resolvedGrafik && !tabelData) return 'chart';
    return defaultView;
  });

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Transform to Recharts data array format
  const chartData = useMemo(() => {
    if (!resolvedGrafik) return [];
    return resolvedGrafik.labels.map((label, idx) => {
      const item: any = { name: label };
      resolvedGrafik.datasets.forEach(ds => {
        item[ds.nama] = ds.nilai[idx] ?? 0;
      });
      return item;
    });
  }, [resolvedGrafik]);

  // Transform for Pie chart (using first dataset)
  const pieData = useMemo(() => {
    if (!resolvedGrafik || resolvedGrafik.datasets.length === 0) return [];
    const ds = resolvedGrafik.datasets[0];
    return resolvedGrafik.labels.map((label, idx) => ({
      name: label,
      value: ds.nilai[idx] ?? 0
    }));
  }, [resolvedGrafik]);

  // Statistics calculation for quick insight
  const stats = useMemo(() => {
    if (!resolvedGrafik || resolvedGrafik.datasets.length === 0) return null;
    const primary = resolvedGrafik.datasets[0];
    const vals = primary.nilai.filter(v => typeof v === 'number');
    if (vals.length === 0) return null;

    const maxVal = Math.max(...vals);
    const minVal = Math.min(...vals);
    const maxIdx = primary.nilai.indexOf(maxVal);
    const minIdx = primary.nilai.indexOf(minVal);
    const sum = vals.reduce((a, b) => a + b, 0);
    const avg = Math.round((sum / vals.length) * 10) / 10;

    return {
      variableName: primary.nama,
      max: { val: maxVal, label: resolvedGrafik.labels[maxIdx] },
      min: { val: minVal, label: resolvedGrafik.labels[minIdx] },
      avg,
      sum
    };
  }, [resolvedGrafik]);

  const handleCopyCitation = (label: string, val: number, varName: string, idx: number) => {
    const citation = `Berdasarkan data grafik "${resolvedGrafik?.judulGrafik || judulKasus}", pada ${label} tercatat nilai ${varName} sebesar ${val.toLocaleString('id-ID')}.`;
    navigator.clipboard?.writeText(citation);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
    if (onCiteData) {
      onCiteData(citation);
    }
  };

  // Recharts styling colors based on dark mode
  const gridColor = isDarkMode ? '#334155' : '#e2e8f0';
  const axisColor = isDarkMode ? '#94a3b8' : '#64748b';
  const tooltipBg = isDarkMode ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDarkMode ? '#1e293b' : '#cbd5e1';
  const tooltipTextColor = isDarkMode ? '#f8fafc' : '#0f172a';

  if (!resolvedGrafik && !tabelData) {
    return null;
  }

  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs transition-colors ${className}`}>
      {/* HEADER WITH CONTROLS */}
      <div className="p-3.5 sm:p-4 bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {resolvedGrafik?.judulGrafik || `Data & Fakta: ${judulKasus}`}
            </h4>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hidden md:inline-block">
              Data Nyata Siswa
            </span>
          </div>
          {resolvedGrafik?.deskripsiGrafik && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-8">
              {resolvedGrafik.deskripsiGrafik}
            </p>
          )}
        </div>

        {/* View and Chart Type Switchers */}
        {allowToggleView && !isPrintMode && (
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Chart Type Toggles (if chart exists) */}
            {resolvedGrafik && (
              <div className="flex items-center bg-slate-200/70 dark:bg-slate-750 p-0.5 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setActiveChartType('bar')}
                  className={`p-1.5 rounded-lg transition-all ${
                    activeChartType === 'bar'
                      ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 font-bold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Diagram Batang (Bar Chart)"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChartType('line')}
                  className={`p-1.5 rounded-lg transition-all ${
                    activeChartType === 'line'
                      ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 font-bold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Diagram Garis Tren (Line Chart)"
                >
                  <LineChartIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChartType('area')}
                  className={`p-1.5 rounded-lg transition-all ${
                    activeChartType === 'area'
                      ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 font-bold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Diagram Area (Area Chart)"
                >
                  <AreaChartIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChartType('pie')}
                  className={`p-1.5 rounded-lg transition-all ${
                    activeChartType === 'pie'
                      ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 font-bold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Diagram Lingkaran (Pie Chart)"
                >
                  <PieChartIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* View Mode Switcher: Split / Chart / Table */}
            {resolvedGrafik && tabelData && (
              <div className="flex items-center bg-slate-200/70 dark:bg-slate-750 p-0.5 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className={`px-2 py-1 rounded-lg flex items-center gap-1 font-semibold transition-all ${
                    viewMode === 'split'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Columns2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Keduanya</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('chart')}
                  className={`px-2 py-1 rounded-lg flex items-center gap-1 font-semibold transition-all ${
                    viewMode === 'chart'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3 h-3" />
                  <span>Grafik</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-2 py-1 rounded-lg flex items-center gap-1 font-semibold transition-all ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <TableIcon className="w-3 h-3" />
                  <span>Tabel</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* QUICK STATS CHIPS (FOR CRITICAL THINKING & CITATION) */}
      {stats && (viewMode === 'chart' || viewMode === 'split') && (
        <div className="px-4 py-2 bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Wawasan Kunci:
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800 text-slate-700 dark:text-slate-300">
            Tertinggi: <strong>{stats.max.label}</strong> ({stats.max.val.toLocaleString('id-ID')})
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            Terendah: <strong>{stats.min.label}</strong> ({stats.min.val.toLocaleString('id-ID')})
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            Rata-rata: <strong>{stats.avg.toLocaleString('id-ID')}</strong>
          </span>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="p-4 sm:p-5">
        <div className={`grid gap-6 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
          {/* CHART VIEW */}
          {resolvedGrafik && (viewMode === 'chart' || viewMode === 'split') && (
            <div className={`${viewMode === 'split' ? 'lg:col-span-7' : 'w-full'} space-y-2`}>
              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {activeChartType === 'bar' ? (
                    <BarChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke={axisColor}
                        tick={{ fontSize: 11 }}
                        interval={0}
                        angle={chartData.length > 5 ? -25 : 0}
                        textAnchor={chartData.length > 5 ? 'end' : 'middle'}
                      />
                      <YAxis stroke={axisColor} tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: tooltipBg,
                          borderColor: tooltipBorder,
                          color: tooltipTextColor,
                          borderRadius: '0.75rem',
                          fontSize: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      {resolvedGrafik.datasets.map((ds, idx) => (
                        <Bar
                          key={ds.nama}
                          dataKey={ds.nama}
                          fill={ds.warna || PALETTE[idx % PALETTE.length]}
                          radius={[6, 6, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  ) : activeChartType === 'line' ? (
                    <LineChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke={axisColor}
                        tick={{ fontSize: 11 }}
                        interval={0}
                        angle={chartData.length > 5 ? -25 : 0}
                        textAnchor={chartData.length > 5 ? 'end' : 'middle'}
                      />
                      <YAxis stroke={axisColor} tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: tooltipBg,
                          borderColor: tooltipBorder,
                          color: tooltipTextColor,
                          borderRadius: '0.75rem',
                          fontSize: '12px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      {resolvedGrafik.datasets.map((ds, idx) => (
                        <Line
                          key={ds.nama}
                          type="monotone"
                          dataKey={ds.nama}
                          stroke={ds.warna || PALETTE[idx % PALETTE.length]}
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                        />
                      ))}
                    </LineChart>
                  ) : activeChartType === 'area' ? (
                    <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke={axisColor}
                        tick={{ fontSize: 11 }}
                        interval={0}
                        angle={chartData.length > 5 ? -25 : 0}
                        textAnchor={chartData.length > 5 ? 'end' : 'middle'}
                      />
                      <YAxis stroke={axisColor} tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: tooltipBg,
                          borderColor: tooltipBorder,
                          color: tooltipTextColor,
                          borderRadius: '0.75rem',
                          fontSize: '12px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      {resolvedGrafik.datasets.map((ds, idx) => (
                        <Area
                          key={ds.nama}
                          type="monotone"
                          dataKey={ds.nama}
                          stroke={ds.warna || PALETTE[idx % PALETTE.length]}
                          fill={ds.warna || PALETTE[idx % PALETTE.length]}
                          fillOpacity={0.25}
                          strokeWidth={2}
                        />
                      ))}
                    </AreaChart>
                  ) : (
                    <PieChart>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: tooltipBg,
                          borderColor: tooltipBorder,
                          color: tooltipTextColor,
                          borderRadius: '0.75rem',
                          fontSize: '12px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={85}
                        innerRadius={35}
                        paddingAngle={3}
                        label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Data citation helper buttons */}
              {interactive && onCiteData && (
                <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Klik untuk salin bukti data:</span>
                  {resolvedGrafik.labels.slice(0, 4).map((label, idx) => {
                    const ds = resolvedGrafik.datasets[0];
                    const val = ds?.nilai[idx] ?? 0;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleCopyCitation(label, val, ds.nama, idx)}
                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Salin kutipan bukti angka ini untuk dimasukkan ke jawabanmu"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-400" />
                        )}
                        <span>{label}: {val.toLocaleString('id-ID')}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TABLE VIEW */}
          {tabelData && (viewMode === 'table' || viewMode === 'split') && (
            <div className={`${viewMode === 'split' ? 'lg:col-span-5' : 'w-full'} space-y-2`}>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-semibold mb-1">
                <span className="flex items-center gap-1">
                  <TableIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Tabel Rincian Data
                </span>
                <span className="text-[10px] text-slate-400">
                  {tabelData.baris.length} Baris Data
                </span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100/90 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      {tabelData.headers.map((h, i) => (
                        <th key={i} className="p-2.5 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {tabelData.baris.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-2.5 font-medium text-slate-800 dark:text-slate-200">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
