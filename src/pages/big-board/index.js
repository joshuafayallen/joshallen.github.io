import React, { useMemo, useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../../components/layout';
import loadable from '@loadable/component';
import posteriorData from '../../fitted-data/posterior-summaries.json';
import PropTypes from 'prop-types';

const RankingsTable = loadable(() => import('../../components/RankingsTable'));
const PlayerComparison = loadable(() => import('../../components/PlayerComparision'));

// ─── styled components ────────────────────────────────────────────────────────

const Main = styled.main`
  padding: 100px 0 80px;
  max-width: 1100px;

  @media (max-width: 768px) {
    padding: 80px 0 60px;
  }
`;

const PageHeader = styled.header`
  margin-bottom: 56px;
`;

const Eyebrow = styled.p`
  font-family: var(--font-mono);
  font-size: var(--fz-md);
  color: var(--green);
  margin-bottom: 16px;
`;

const Title = styled.h1`
  font-size: clamp(32px, 5vw, 52px);
  font-weight: 600;
  color: var(--lightest-slate);
  line-height: 1.1;
  margin-bottom: 20px;
`;

const Subtitle = styled.p`
  font-size: var(--fz-lg);
  color: var(--slate);
  max-width: 580px;
  line-height: 1.7;

  a {
    color: var(--green);
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ModelNote = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  padding: 8px 16px;
  background: rgba(100, 255, 218, 0.05);
  border: 1px solid rgba(100, 255, 218, 0.15);
  border-radius: var(--border-radius);
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  color: var(--slate);

  span {
    color: var(--green);
  }
`;

const Section = styled.section`
  margin-bottom: 72px;
`;

const SectionLabel = styled.p`
  font-family: var(--font-mono);
  font-size: var(--fz-m);
  color: var(--green);
  margin-bottom: 4px;
`;

const SectionTitle = styled.h2`
  font-size: clamp(16px, 2vw, 22px);
  font-weight: 600;
  color: var(--lightest-slate);
  margin-bottom: 8px;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: var(--lightest-navy);
  margin-bottom: 28px;
`;

// ─── page ─────────────────────────────────────────────────────────────────────

const RankingsPage = ({ location }) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const data = useMemo(() => [...posteriorData].sort((a, b) => a.ranking - b.ranking), []);

  const players = useMemo(() => data.map(d => d.player), [data]);

  const stats = useMemo(() => {
    const obj = {};
    data.forEach(d => {
      obj[d.player] = {
        mean: d.mean,
        sd: d.sd,
        lo95: d['hdi_3%'],
        hi95: d['hdi_97%'],
        lo50: d.mean - 0.674 * d.sd,
        hi50: d.mean + 0.674 * d.sd,
      };
    });
    return obj;
  }, [data]);

  RankingsPage.propTypes = {
    location: PropTypes.object.isRequired,
  };

  return (
    <Layout location={location}>
      <Main>
        <PageHeader>
          <Eyebrow>Plackett-Luce model</Eyebrow>
          <Title>Consensus Big Board</Title>
          <Subtitle>
            Rankings derived from a Bayesian{' '}
            <a
              href="https://en.wikipedia.org/wiki/Plackett%E2%80%93Luce_model"
              target="_blank"
              rel="noopener noreferrer">
              Plackett-Luce model
            </a>{' '}
            fit to scout rankings.
          </Subtitle>
          <ModelNote>
            <span>n = {posteriorData.length}</span> players · <span>10</span> scout sources · Data
            are provided by{' '}
            <a href="https://www.profootballnetwork.com/nfl-draft-hq/industry-consensus-big-board">
              PFSN
            </a>
          </ModelNote>
        </PageHeader>

        <Section>
          <SectionLabel>Prospect Rankings</SectionLabel>
          <Divider />
          <SectionTitle>Search Prospects</SectionTitle>
          {isClient && <RankingsTable data={data} players={players} stats={stats} />}
        </Section>

        <Section>
          <SectionLabel>02. Compare Players</SectionLabel>
          <Divider />
          <SectionTitle>Compare Prospects</SectionTitle>
          {isClient && <PlayerComparison data={data} players={players} stats={stats} />}
        </Section>
      </Main>
    </Layout>
  );
};

export default RankingsPage;
export const Head = () => <title>Big Board | Josh Allen</title>;
