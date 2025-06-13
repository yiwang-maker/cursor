# -*- coding: utf-8 -*-

from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class Message:
    role: str
    content: str
    timestamp: datetime = datetime.now()
    metadata: Optional[Dict] = None

class ConversationContext:
    def __init__(self, system_prompt: str):
        self.messages: List[Message] = []
        self.system_prompt = Message(
            role="system",
            content=system_prompt
        )
        self.messages.append(self.system_prompt)
    
    def add_message(self, role: str, content: str, metadata: Dict = None) -> None:
        message = Message(role=role, content=content, metadata=metadata)
        self.messages.append(message)
    
    def get_context_window(self, window_size: int = 5) -> List[Message]:
        return self.messages[-window_size:] if len(self.messages) > window_size else self.messages
    
    def format_for_llm(self) -> str:
        formatted = []
        for msg in self.messages:
            formatted.append(f"{msg.role}: {msg.content}")
        return "\n".join(formatted)

def interactive_chat():
    context = ConversationContext(
        system_prompt="你是一个友善的 AI 助手，专注于帮助用户学习编程。"
    )
    
    print("🤖 欢迎来到简单对话系统！(输入 'quit' 退出)")
    print("=" * 50)
    
    while True:
        # 将 input() 函数的编码方式明确指定为 utf-8
        user_input = input("\n👤 你: ").encode('utf-8').decode('utf-8')

        if user_input.lower() == 'quit':
            print("\n👋 再见！")
            break
            
        # 添加用户消息
        context.add_message("user", user_input)
        
        # 模拟 AI 响应（在实际应用中，这里会调用真实的 AI 模型）
        ai_response = f"我收到了你的消息：{user_input}"
        context.add_message("assistant", ai_response)
        
        print(f"\n🤖 AI: {ai_response}")
        
        # 打印当前上下文窗口
        print("\n📝 当前对话上下文（最近3条）:")
        print("-" * 50)
        for msg in context.get_context_window(3):
            print(f"{msg.role}: {msg.content}")
        print("-" * 50)

if __name__ == "__main__":
    interactive_chat()

