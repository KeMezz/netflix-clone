import React from "react";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { apiKeyModalOpenAtom } from "../atom";
import ApiKeyNotice from "./ApiKeyNotice";

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 250;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const ModalBox = styled(motion.div)`
  position: relative;
  max-width: 680px;
  width: 100%;
  z-index: 260;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 130px;
  right: 16px;
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 270;
  transition: background-color 0.2s;
  &:hover {
    background-color: rgba(255, 255, 255, 0.4);
  }
`;

export function ApiKeyModal() {
  const [isOpen, setIsOpen] = useRecoilState(apiKeyModalOpenAtom);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsOpen(false)}
      >
        <ModalBox
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <CloseButton onClick={() => setIsOpen(false)} aria-label="닫기">
            ✕
          </CloseButton>
          <ApiKeyNotice onSuccess={() => setIsOpen(false)} />
        </ModalBox>
      </Overlay>
    </AnimatePresence>
  );
}

export default ApiKeyModal;
