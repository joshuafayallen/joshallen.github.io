import React, { useRef, useState, useMemo } from 'react';
import styled from 'styled-components';
import DataTable from 'datatables.net-react';
import DataTablesCore from 'datatables.net'; 
import 'datatables.net-dt'; 


DataTable.use(DataTablesCore);


const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
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

const FadeWrapper = styled.div<{ $isExpanded: boolean }>`
  position: relative;
  ${props => !props.$isExpanded && `
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: linear-gradient(transparent, var(--navy));
      pointer-events: none;
    }
  `}
`;

const ExpandButton = styled.button`
  background: transparent;
  border: 1px solid var(--green);
  color: var(--green);
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 8px 16px;
  border-radius: var(--border-radius);
  cursor: pointer;
  margin: 20px auto;
  display: block;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.1em;

  &:hover {
    background: rgba(100, 255, 218, 0.1);
    box-shadow: 0 0 15px rgba(100, 255, 218, 0.1);
  }
`;
const Wrapper = styled.div`
  width: 100%;
   width: 100%;
  .datatable-custom {
    width: 100% !important;
    border-collapse: collapse !important;
    font-size: 13px;
    
    thead th {
      text-align: left; padding: 10px 14px; font-family: var(--font-mono); 
      font-size: 10px; text-transform: uppercase; color: var(--slate);
      border-bottom: 1px solid var(--green) !important;
    }
    tbody tr {
      background-color: transparent !important;
      border-bottom: 1px solid var(--lightest-navy) !important;
      &:hover { background: var(--light-navy) !important; }
      td { padding: 10px 14px; color: var(--slate); }
    }
  }

  .dt-paging {
    display: flex;
    justify-content: center;
    margin-top: 2rem;

    nav {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .dt-paging-button {
      background: transparent !important;
      border: 1px solid transparent !important;
      color: var(--lightest-slate);
      font-family: var(--font-sans, sans-serif);
      font-size: 14px;
      padding: 6px 12px;
      cursor: pointer;
      transition: all 0.2s;

      &.current {
        background: var(--lightest-slate);
        border: 1px solid var(--darkest-slate);
        color: var(--green);
        border-radius: 4px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      }

      &:not(.current):not(.disabled):hover {
        color: #000 !important;
        text-decoration: underline;
      }

      &.disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      &.first, &.last {
        display: none;
      }
    }
  }
`;

const TopBar = styled.div`display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 12px;`;
const SearchInput = styled.input`
  background: var(--light-navy); border: 1px solid var(--lightest-navy); border-radius: var(--border-radius);
  color: var(--lightest-slate); font-family: var(--font-mono); font-size: var(--fz-xs); padding: 8px 14px; width: 220px;
  outline: none; &:focus { border-color: var(--green); }
`;
const ResultCount = styled.span`font-family: var(--font-mono); font-size: var(--fz-xs); color: var(--dark-slate);`;


export function RankingsTable({ data = [] }: { data: any[] }) {
  const tableRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activePosition, setActivePosition] = useState<string | null>(null);
  const [info, setInfo] = useState({ displayed: data?.length || 0, total: data?.length || 0 });

  // Derive unique positions from data
  const positions = useMemo(() => {
    const unique = Array.from(new Set(data.map(d => d.Position).filter(Boolean)));
    return unique.sort();
  }, [data]);

  const updateInfo = () => {
    const api = tableRef.current?.dt();
    if (!api) return;
    setInfo({
      displayed: api.page.info().recordsDisplay,
      total: api.page.info().recordsTotal,
    });
  };

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    const api = tableRef.current.dt();
    api.search(val).draw();
    updateInfo();
  };

  const onPositionFilter = (position: string | null) => {
    setActivePosition(position);
    const api = tableRef.current.dt();
    // Column index 3 is Position
    if (position) {
      api.column(3).search(`^${position}$`, true, false).draw();
    } else {
      api.column(3).search('').draw();
    }
    updateInfo();
  };

  const columns = [
    {
      data: 'ranking',
      title: 'Rank',
      render: (val: number) => {
        const isTop5 = val <= 5;
        return `<span style="
          display: inline-flex; align-items: center; justify-content: center; 
          width: 28px; height: 28px; border-radius: 50%; font-family: var(--font-mono); font-size: 11px;
          background: ${isTop5 ? 'rgba(100,255,218,0.15)' : 'rgba(255,255,255,0.03)'};
          color: ${isTop5 ? 'var(--green)' : 'var(--slate)'};
          border: 1px solid ${isTop5 ? 'rgba(100,255,218,0.3)' : 'rgba(255,255,255,0.05)'};
        ">${val}</span>`;
      }
    },
    { data: 'player', title: 'Prospect', className: 'prospect-cell' },
    { data: 'School', title: 'School' },
    { data: 'Position', title: 'Position' },
    { 
      data: 'mean', 
      title: 'Implied Skill',
      render: (val: number) => `<span style="color: var(--green); font-family: var(--font-mono)">${val.toFixed(2)}</span>`
    },
    { data: 'PFSN', title: 'PFSN', defaultContent: '—' },
    { data: 'Bleacher Report', title: 'Bleacher Report', defaultContent: '—' },
    { data: 'CBS', title: 'CBS', defaultContent: '—' },
    { data: 'ESPN', title: 'ESPN', defaultContent: '—' },
    { data: 'PFF', title: 'PFF', defaultContent: '—' },
    { data: 'The Athletic', title: 'The Athletic', defaultContent: '—' },
    { data: 'Todd McShay', title: 'Todd McShay', defaultContent: '—' },
    { data: 'Yahoo', title: 'Yahoo', defaultContent: '—' },
    { data: 'Daniel Jeremiah', title: 'Daniel Jeremiah', defaultContent: '—' },
    { data: 'The Ringer', title: 'The Ringer', defaultContent: '—' }
  ];

  return (
    <Wrapper>
      <TopBar>
        <SearchInput placeholder="search players..." onChange={onSearch} />
        <ResultCount>{info.displayed} of {info.total} players</ResultCount>
      </TopBar>

      <FilterBar>
        <FilterChip
          $active={activePosition === null}
          onClick={() => onPositionFilter(null)}
        >
          All
        </FilterChip>
        {positions.map(pos => (
          <FilterChip
            key={pos}
            $active={activePosition === pos}
            onClick={() => onPositionFilter(pos)}
          >
            {pos}
          </FilterChip>
        ))}
      </FilterBar>

      <DataTable
        data={data}
        columns={columns}
        ref={tableRef}
        className="datatable-custom"
        options={{
          layout: {
            topStart: null,
            topEnd: null,
            bottomStart: 'info',
            bottomEnd: 'paging'
          },
          pageLength: 10,
          pagingType: 'full_numbers',
          order: [[0, 'asc']],
          language: {
            entries: { _: 'prospects', 1: 'prospect' },
            paginate: { first: '«', previous: '←', next: '→', last: '»' }
          }
        }}
      />
    </Wrapper>
  );
}

export default RankingsTable;