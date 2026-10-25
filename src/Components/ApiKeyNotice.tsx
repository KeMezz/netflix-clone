import React, { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import styled from "styled-components";
import { apiKeyModalOpenAtom } from "../atom";
import { useApiSession } from "../tmdb";

const NoticeWrapper = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 120px 24px 60px;
  text-align: center;
`;

const Card = styled.div`
  max-width: 640px;
  width: 100%;
  background-color: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 36px 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Title = styled.h2`
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const Description = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: #ccc;
  word-break: keep-all;
`;

const SecurityNotice = styled.div`
  background-color: rgba(229, 9, 20, 0.1);
  border-left: 4px solid #e50914;
  padding: 12px 14px;
  border-radius: 4px;
  text-align: left;
  font-size: 13px;
  line-height: 1.5;
  color: #ddd;
  p {
    margin-bottom: 6px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  strong {
    color: #fff;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
`;

const InputRow = styled.div`
  display: flex;
  gap: 8px;
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const KeyInput = styled.input`
  flex: 1;
  background-color: #333;
  border: 1px solid #555;
  border-radius: 6px;
  padding: 12px 14px;
  color: #fff;
  font-size: 14px;
  &:focus {
    border-color: #e50914;
  }
`;

const SubmitBtn = styled.button`
  background-color: #e50914;
  color: #fff;
  font-weight: 600;
  padding: 12px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  white-space: nowrap;
  &:hover {
    background-color: #f40612;
  }
`;

const ClearBtn = styled.button`
  background-color: transparent;
  color: #aaa;
  border: 1px solid #666;
  font-weight: 500;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  &:hover {
    color: #fff;
    border-color: #999;
  }
`;

const ExternalLink = styled.a`
  font-size: 13px;
  color: #888;
  text-decoration: underline;
  transition: color 0.2s;
  &:hover {
    color: #fff;
  }
`;

interface ApiKeyNoticeProps {
  onSuccess?: () => void;
}

export function ApiKeyNotice({ onSuccess }: ApiKeyNoticeProps) {
  const { enabled, generation, replaceKey } = useApiSession();
  const setModalOpen = useSetRecoilState(apiKeyModalOpenAtom);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => setInputValue(""), [generation]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    replaceKey(inputValue);
    setInputValue("");
    setModalOpen(false);
    if (onSuccess) onSuccess();
  };

  const handleClear = () => {
    replaceKey("");
    setInputValue("");
    setModalOpen(false);
  };

  return (
    <NoticeWrapper>
      <Card>
        <Title>
          <i className="fas fa-key" style={{ color: "#e50914" }} />
          TMDB API 키 설정
        </Title>
        <Description>
          The Movie Database (TMDB) API를 활용하여 실시간 콘텐츠를 제공합니다.
          <br />
          API 키 입력 전에는 TMDB API 요청이 발생하지 않습니다. 기존 Google Fonts 및 Font Awesome CDN 요청은 별도입니다.
        </Description>
        <SecurityNotice>
          <p>
            <strong>🔒 보안 및 메모리 전용 안내:</strong> 입력하신 API 키는 브라우저 메모리에만 일시 보존되며,
            로컬 스토리지(localStorage)나 세션 스토리지(sessionStorage)에 영구 저장되지 않습니다.
          </p>
          <p>
            <strong>⚠️ 노출 범위 안내:</strong> 키 교체·끄기 및 페이지를 떠나는 pagehide 이벤트에서 앱 상태와 캐시에서 키를 제거하고 진행 중인 요청을 취소합니다. JavaScript 문자열의 완전한 즉시 파기는 보장할 수 없습니다.
            브라우저 개발자 도구(DevTools 네트워크 탭) 및 TMDB API 서버로 전송되는 요청에는 키가 포함되어 노출됩니다.
          </p>
        </SecurityNotice>
        <Form onSubmit={handleApply}>
          <InputRow>
            <KeyInput
              type="password"
              placeholder="TMDB v3 API Key 입력 (예: 32자 hex)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoComplete="off"
              aria-label="TMDB API Key"
            />
            <SubmitBtn type="submit">API 키 적용</SubmitBtn>
          </InputRow>
          {enabled && (
            <ClearBtn type="button" onClick={handleClear}>
              키 끄기 / 삭제 (메모리 초기화)
            </ClearBtn>
          )}
        </Form>
        <div>
          <ExternalLink
            href="https://www.themoviedb.org/settings/api"
            target="_blank"
            rel="noopener noreferrer"
          >
            TMDB API 키 무료 발급 안내 (themoviedb.org)
          </ExternalLink>
        </div>
      </Card>
    </NoticeWrapper>
  );
}

export default ApiKeyNotice;
