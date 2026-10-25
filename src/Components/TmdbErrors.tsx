import { useSetRecoilState } from "recoil";
import styled from "styled-components";
import { apiKeyModalOpenAtom } from "../atom";
import { TmdbError } from "../api";
import { useApiSession } from "../tmdb";

const Card = styled.section`
  margin: 90px 24px 24px;
  padding: 24px;
  background: #242424;
  border: 1px solid #e50914;
  border-radius: 8px;
  line-height: 1.7;
  button { cursor: pointer; margin: 12px 16px 0 0; text-decoration: underline; }
`;
type FailedQuery = { isError: boolean; error: TmdbError | null; refetch: () => unknown };
export default function TmdbErrors({ queries }: { queries: [string, FailedQuery][] }) {
  const failed = queries.filter(([, query]) => query.isError);
  const setOpen = useSetRecoilState(apiKeyModalOpenAtom);
  const { replaceKey } = useApiSession();
  if (!failed.length) return null;
  const unauthorized = failed.some(([, query]) => query.error?.status === 401 || query.error?.status === 403);
  const network = failed.some(([, query]) => !query.error?.status);
  return <Card role="alert">
    <h2>{unauthorized ? "TMDB API 키가 거부되었습니다 (401/403)." : network ? "TMDB에 연결할 수 없습니다. 네트워크 연결을 확인해 주세요." : "TMDB 콘텐츠를 불러오지 못했습니다."}</h2>
    <p>불러오지 못한 항목: {failed.map(([label]) => label).join(", ")}</p>
    <p>{unauthorized ? "키를 다시 입력하거나 API 사용을 꺼 주세요. 인증 오류는 자동 재시도하지 않습니다." : "자동 재시도는 요청당 한 번으로 제한됩니다. 다시 시도하거나 API 사용을 꺼 주세요."}</p>
    <button onClick={() => setOpen(true)}>키 다시 입력</button>
    <button onClick={() => replaceKey("")}>키 끄기</button>
    {!unauthorized && <button onClick={() => failed.forEach(([, query]) => query.refetch())}>다시 시도</button>}
  </Card>;
}
