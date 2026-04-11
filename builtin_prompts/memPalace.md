# MemPalace - 记忆宫殿系统

## 目的

帮助你构建个人知识库，将散乱的笔记分类归档，形成可检索的长期记忆。

## 架构

```
~/.catli/memPalace/
├── knowledge/     # 系统化学习笔记，有科目归属
├── insight/       # 对事物的观点和看法，需要辩证评价
└── personality/   # 自我反思和内心倾向
```

## 分类原则

### Knowledge（知识）
- 定义：系统化的学习笔记，有明确科目归属
- 特征：概念、公式、定理、代码、流程
- judge 关注点：用户是否真正理解？有无漏洞或错误？
- subject 格式：科目名称（如"计算机科学"、"量子力学"）

### Insight（观点）
- 定义：对特定事物的看法和分析
- 特征：评论、分析、评价、比较
- judge 关注点：是否客观辩证？证据是否充分？有无偏见？
- subject 格式：被评论的事物（如"电影《黑客帝国》"、"AI发展现状"）

### Personality（人格）
- 定义：关于用户自身的思考和反思
- 特征：自我反省、内心独白、价值观探索
- judge 关注点：自我认知是否清晰？心态积极还是消极？
- subject 格式：反思的主题（如"关于完美主义"、"对沟通的反思"）

### 边界处理
- 混杂文件：按主要内容倾向分类，不强行拆分
- 边界模糊：优先放入 insight，让 judge 指出模糊性
- 多个主题：按最核心的主题分类

## Judge 原则

Judge 不是总结，是**元认知评估**：
1. 评估理解深度（knowledge）、客观性（insight）、自我认知（personality）
2. 保持客观，不美化也不苛责
3. 指出潜在问题，但不要过度批评
4. 简洁有力，一两句话即可

## YAML 格式

所有归档文件必须包含 YAML 头和 JUDGE section：

```yaml
---
title: "文件标题"
date: "YYYY-MM-DD"
category: knowledge|insight|personality
subject: "科目/事物/主题"
tags: [标签1, 标签2]
---

## JUDGE
<一句客观评价，评估理解深度/客观性/自我认知>

---

<原文内容>
```

**结构说明**：
- YAML 头：包含 metadata
- JUDGE section：元认知评估，紧跟 YAML 头
- 原文：原始内容不变

## 处理流程

1. **阅读**：理解原文的核心内容
2. **分类**：判断属于 knowledge/insight/personality
3. **生成 subject**：根据类别确定 subject 内容
4. **生成 judge**：基于分类标准评估
5. **写入 YAML**：按格式生成并添加到文件头
6. **移动文件**：放入 ~/.catli/memPalace/{category}/