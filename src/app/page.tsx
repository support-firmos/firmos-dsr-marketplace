import { BlockPage } from '@/components/src-app-page';
import { TokenGate } from '@/components/TokenGate';
import { getSession } from '@/utils/session';
import { copilotApi } from 'copilot-node-sdk';

/**
 * The revalidate property determine's the cache TTL for this page and
 * all fetches that occur within it. This value is in seconds.
 */

export const revalidate = 180;

async function Content({ searchParams }: { searchParams: SearchParams }) {
  const { client, company } = await getSession(searchParams);

  return (
    <main>
      <BlockPage sessionData={{ client, company }} />
    </main>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (!process.env.NEXT_PUBLIC_COPILOT_API_KEY) {
    throw new Error(
      'NEXT_PUBLIC_COPILOT_API_KEY is not defined in environment variables',
    );
  }

  const copilot = copilotApi({
    apiKey: process.env.NEXT_PUBLIC_COPILOT_API_KEY,
    token:
      'token' in searchParams && typeof searchParams.token === 'string'
        ? searchParams.token
        : undefined,
  });

  return (
    <TokenGate searchParams={searchParams}>
      <Content searchParams={searchParams} />
    </TokenGate>
  );
}
