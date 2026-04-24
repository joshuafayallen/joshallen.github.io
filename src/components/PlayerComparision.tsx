import React, { useState, useEffect, useRef, useMemo } from 'react';
import styled from 'styled-components';
import PointInterval from './PointInterval';


const SERIES_COLORS = [
  '#64ffda',
  '#57cbff',
  '#ff9f7f',
  '#c792ea',
  '#ffcc66',
  '#80cbc4',
  '#f78c6c',
  '#89ddff',
];

interface PlayerData {
  player: string;
  mean: number;
  sd: number;
  'hdi_3%': number;
  'hdi_97%': number;
  [key: string]: any; 
}

// --- Styled Components ---
const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
  width: 100%;
  max-width: 400px;
`;

const SearchInput = styled.input`
  width: 100%;
  background: var(--light-navy);
  border: 1px solid var(--lightest-navy);
  border-radius: var(--border-radius);
  padding: 10px 15px;
  color: var(--lightest-slate);
  font-family: var(--font-mono);
  &:focus { outline: 1px solid var(--green); }
`;

const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 1.5rem;
`;

const FilterChip = styled.button`
  background: ${(props: { $active: boolean }) => props.$active ? 'rgba(100, 255, 218, 0.15)' : 'transparent'};
  border: 1px solid ${(props: { $active: boolean }) => props.$active ? 'rgba(100, 255, 218, 0.5)' : 'var(--lightest-navy)'};
  color: ${(props: { $active: boolean }) => props.$active ? 'var(--green)' : 'var(--slate)'};
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 5px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  &:hover {
    border-color: var(--green);
    color: var(--green);
  }
`;


const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--light-navy);
  border: 1px solid var(--lightest-navy);
  z-index: 10;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 10px 30px -15px rgba(2, 12, 27, 0.7);
`;

const DropdownItem = styled.div`
  padding: 10px 15px;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--slate);
  &:hover { background: var(--lightest-navy); color: var(--green); }
`;

const ChipGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 2rem;
`;

const Chip = styled.button<{ $bordercolor: string }>`
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 20px;
  /* Start with a semi-transparent version of the player's unique color */
  border: 1px solid ${props => props.$bordercolor}80; 
  background: rgba(100, 255, 218, 0.03);
  color: var(--lightest-slate);
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.645, 0.045, 0.355, 1);
  white-space: nowrap;

  &:hover {
    /* Reactivity: Solidify border and add a subtle glow on hover */
    border-color: ${props => props.$bordercolor};
    background: rgba(100, 255, 218, 0.1);
    transform: translateY(-1px);
    box-shadow: 0 4px 10px -5px ${props => props.$bordercolor}66;
    color: var(--green);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ColorDot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$color};
  margin-right: 8px;
`;

const ChartWrap = styled.div`
  background: rgba(2, 12, 27, 0.3);
  padding: 2rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--lightest-navy);
  overflow: visible;
  position: relative;
`;

const PIRow = styled.div`
  display: grid;
  grid-template-columns: 160px 1fr;
  align-items: center;
  margin-bottom: 12px;
  gap: 20px;
`;

const PILabel = styled.span`
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--lightest-slate);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AxisWrap = styled.div`
  margin-top: 20px;
  padding-left: 160px;
  overflow: visibile;
`;

const AxisLabel = styled.div`
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--lightest-slate);
  margin-top: 10px;
  text-align: center;
  padding-left: 160px;
`;

const Legend = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  margin-bottom: 20px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--lightest-slate);
`;

// --- Component ---
const PlayerComparison = ({ data }: { data: PlayerData[] }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [chartWidth, setChartWidth] = useState(500);
  const [searchQuery, setSearchQuery] = useState("");
  const [activePosition, setActivePosition] = useState<string | null>(null);

  const [selected, setSelected] = useState<string[]>(() =>
    data.slice(0, 5).map(d => d.player)
  );

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (!isClient || !wrapRef.current) return;
    const observer = new ResizeObserver(entries => {
      setChartWidth(entries[0].contentRect.width - 250);
    });
    observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, [isClient]);

  const removePlayer = (name: string) => {
    setSelected(prev => prev.filter(p => p !== name));
  };

  // Derive valid positions from data
  const positions = useMemo(() => {
  const unique = Array.from(new Set(data.map(d => d.Position).filter(Boolean)));
  return unique.sort();
}, [data]);

  // Filter pool by active position before search
  const positionFilteredData = useMemo(() => {
    if (!activePosition) return data;
    return data.filter(d => d.Position === activePosition);
  }, [data, activePosition]);

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return positionFilteredData
      .filter(d => d.player.toLowerCase().includes(query) && !selected.includes(d.player))
      .slice(0, 5);
  }, [positionFilteredData, searchQuery, selected]);

  const selectedData = useMemo(() =>
    data.filter(d => selected.includes(d.player)),
    [data, selected]
  );

  const { domainMin, domainMax } = useMemo(() => {
    if (!selectedData.length) return { domainMin: -2, domainMax: 2 };
    const mins = selectedData.map(d => d['hdi_3%'] ?? (d.mean - 2 * d.sd));
    const maxs = selectedData.map(d => d['hdi_97%'] ?? (d.mean + 2 * d.sd));
    const gMin = Math.min(...mins);
    const gMax = Math.max(...maxs);
    const pad = (gMax - gMin) * 0.15 || 0.5;
    return { domainMin: gMin - pad, domainMax: gMax + pad };
  }, [selectedData]);

  const xScale = (v: number) => ((v - domainMin) / (domainMax - domainMin)) * chartWidth;
  const ticks = Array.from({ length: 6 }, (_, i) => domainMin + (domainMax - domainMin) * (i / 5));

  if (!isClient) return null;

  return (
    <div ref={wrapRef}>
      {/* Position filter */}
      <FilterBar>
        <FilterChip
          $active={activePosition === null}
          onClick={() => setActivePosition(null)}
        >
          All
        </FilterChip>
        {positions.map(pos => (
          <FilterChip
            key={pos}
            $active={activePosition === pos}
            onClick={() => setActivePosition(pos)}
          >
            {pos}
          </FilterChip>
        ))}
      </FilterBar>

      {/* Player search */}
      <SearchContainer>
        <SearchInput
          placeholder="Type player name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchResults.length > 0 && (
          <Dropdown>
            {searchResults.map(d => (
              <DropdownItem key={d.player} onClick={() => {
                setSelected(prev => [...prev, d.player]);
                setSearchQuery("");
              }}>
                {d.player}
              </DropdownItem>
            ))}
          </Dropdown>
        )}
      </SearchContainer>

      {/* Selected player chips */}
      <ChipGrid>
        {selected.map(name => {
          const idx = data.findIndex(p => p.player === name);
          const color = SERIES_COLORS[idx % SERIES_COLORS.length];
          return (
            <Chip key={name} $bordercolor={color} onClick={() => removePlayer(name)}>
              <ColorDot $color={color} />
              {name} <span style={{ marginLeft: '6px', opacity: 0.6 }}>×</span>
            </Chip>
          );
        })}
      </ChipGrid>

      <ChartWrap>
        <Legend>
          <span>94% HDI —</span>
          <span>● mean</span>
        </Legend>

        {selectedData.map(d => {
          const idx = data.findIndex(p => p.player === d.player);
          return (
            <PIRow key={d.player}>
              <PILabel title={d.player}>{d.player}</PILabel>
              <PointInterval
                stats={d}
                domainMin={domainMin}
                domainMax={domainMax}
                width={chartWidth}
                color={SERIES_COLORS[idx % SERIES_COLORS.length]}
              />
            </PIRow>
          );
        })}

        <AxisWrap>
          <svg width={chartWidth} height={30} style={{ overflow: 'visible', display: 'block' }}>
            <line x1={0} x2={chartWidth} y1={0} y2={0} stroke="var(--lightest-slate)" />
            {ticks.map((t, i) => (
              <g key={i}>
                <line x1={xScale(t)} x2={xScale(t)} y1={0} y2={5} stroke="var(--lightest-slate)" />
                <text x={xScale(t)} y={20} fill="var(--lightest-slate)" fontSize="10" textAnchor="middle" fontFamily="var(--font-mono)">
                  {t.toFixed(1)}
                </text>
              </g>
            ))}
          </svg>
          <AxisLabel>Alpha (Latent Ability)</AxisLabel>
        </AxisWrap>
      </ChartWrap>
    </div>
  );
};

export default PlayerComparison;