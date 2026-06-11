import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import type { TemperatureRecord } from '@/types';
import { cn } from '@/lib/utils';

interface TemperatureChartProps {
  records: TemperatureRecord[];
  minTemp: number;
  maxTemp: number;
  height?: number;
  showThreshold?: boolean;
  className?: string;
}

export function TemperatureChart({
  records,
  minTemp,
  maxTemp,
  height = 200,
  showThreshold = true,
  className,
}: TemperatureChartProps) {
  const data = records.map((record) => ({
    time: new Date(record.timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    temperature: record.temperature,
    isOutOfRange: record.temperature > maxTemp || record.temperature < minTemp,
  }));

  const range = maxTemp - minTemp;
  const yMin = minTemp - range * 0.3;
  const yMax = maxTemp + range * 0.3;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const temp = payload[0].value;
      const isOutOfRange = temp > maxTemp || temp < minTemp;
      return (
        <div className="bg-slate-900/95 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-xl text-sm">
          <p className="text-slate-300 text-xs mb-1">{label}</p>
          <p
            className={cn(
              'font-bold text-lg',
              isOutOfRange ? 'text-red-400' : 'text-cyan-300'
            )}
          >
            {temp.toFixed(1)}°C
          </p>
          {isOutOfRange && (
            <p className="text-red-400 text-xs mt-1">⚠ 温度越界</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="alertGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={[yMin, yMax]}
            tickFormatter={(value) => `${value}°`}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          {showThreshold && (
            <>
              <ReferenceLine
                y={maxTemp}
                stroke="#ef4444"
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={{
                  value: `上限 ${maxTemp}°`,
                  position: 'insideTopRight',
                  fill: '#ef4444',
                  fontSize: 10,
                }}
              />
              <ReferenceLine
                y={minTemp}
                stroke="#3b82f6"
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={{
                  value: `下限 ${minTemp}°`,
                  position: 'insideBottomRight',
                  fill: '#3b82f6',
                  fontSize: 10,
                }}
              />
            </>
          )}
          <Area
            type="monotone"
            dataKey="temperature"
            stroke="#0ea5e9"
            strokeWidth={2}
            fill="url(#tempGradient)"
            dot={false}
            activeDot={{
              r: 6,
              fill: '#0ea5e9',
              stroke: '#fff',
              strokeWidth: 2,
            }}
          />
          {data.some((d) => d.isOutOfRange) && (
            <Line
              type="monotone"
              dataKey={(d) => (d.isOutOfRange ? d.temperature : null)}
              stroke="#ef4444"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
              connectNulls={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
