import { createFileRoute } from '@tanstack/react-router'
import ReportChallenge from '../pages/ReportChallenge'

export const Route = createFileRoute('/report')({
  component: ReportChallenge,
})