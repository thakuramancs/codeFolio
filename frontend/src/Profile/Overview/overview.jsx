import ProblemStats from "./ProblemStats";
import StatsOverview from "./StatsOverview";
import ContestStats from "./ContestStats";
import { useOutletContext } from "react-router-dom";

export default function Overview() {
    // Get data from parent Profile via Outlet context
    const { totalQuestions, totalActiveDays, topicWise, difficultyWise, contestStats, ratingHistory } = useOutletContext() || {};
    return (
        <>
            <StatsOverview totalQuestions={totalQuestions} totalActiveDays={totalActiveDays} />
            <ProblemStats topicWise={topicWise} difficultyWise={difficultyWise} />
            <ContestStats contestStats={contestStats} ratingHistory={ratingHistory} />
        </>
    );
}