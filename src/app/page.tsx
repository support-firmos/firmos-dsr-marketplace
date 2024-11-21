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
  const data = await getSession(searchParams);
  return (
    <main>
      <h1
        className="
    bg-[#14151A] text-white p-2.5 px-5 rounded-md text-lg font-sans 
    shadow-md fixed top-5 left-5 z-[9999] w-auto
  "
      >
        Hello & Welcome,
        <code className="ml-2">
          {data.client?.givenName || data.company?.name || 'Name'}
        </code>
      </h1>

      <BlockPage
        sessionData={{
          client: data.client
            ? {
                id: data.client.id || '',
                givenName: data.client.givenName || '',
                familyName: data.client.familyName || '',
              }
            : undefined,
          company: data.company
            ? {
                name: data.company.name || '', // Ensure name is a non-nullable string
              }
            : undefined,
        }}
      />
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
