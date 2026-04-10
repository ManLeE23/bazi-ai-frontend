# MBTI 接口联调指南

## 总体说明

- 所有接口统一返回结构为：

```json
{
  "code": 0,
  "msg": "ok",
  "data": {}
}
```

- 文档中所有“响应示例”只展示 `data` 字段内部结构，实际返回会多一层 `code` / `msg` 包裹。
- 所有时间字段为 ISO8601 字符串，例如：`"2026-03-26T08:15:30.123456"`.

---

## 一、获取题库：GET /api/mbti/questions

### 1. 请求

- Method: `GET`
- URL: `/api/mbti/questions`
- 认证：按网关规则（后端不强制登录）

### 2. 响应结构

外层类型：`BaseResponse<MBTIQuestion[]>`

```json
{
  "data": [
    {
      "id": 1,
      "text": "我平时的状态更像是：",
      "dimension": "E/I",
      "scene": "general",
      "options": [
        "外向，通过和人交流获得能量",
        "内向，通过独处思考获得能量",
        "看情况"
      ],
      "score_rule": {
        "外向，通过和人交流获得能量": "E",
        "内向，通过独处思考获得能量": "I",
        "看情况": "中立"
      }
    }
  ]
}
```

### 3. 字段说明（MBTIQuestion）

- `id: number`
  - 题目 ID（1–48），全局唯一。
- `text: string`
  - 题干文案。
- `dimension: "E/I" | "S/N" | "T/F" | "J/P"`
  - 所属 MBTI 维度。
- `scene: "general" | "work" | "private" | "social"`
  - 题目情境：
    - `general`：通用
    - `work`：工作情境
    - `private`：私人/亲密情境
    - `social`：社交情境
- `options: string[]`
  - 可选项文本（2 选或 3 选），前端要原样展示。
- `score_rule: Record<string, "E"|"I"|"S"|"N"|"T"|"F"|"J"|"P"|"中立">`
  - 评分规则：选项文本 → 维度字母：
    - 通用题：A / B / 看情况 → 左字母 / 右字母 / 中立
    - 情境题：A / B → 左/右字母（没有中立）

前端要求：

- 渲染题目时只需要用 `text` / `scene` / `options`。
- 提交时 `option` 必须传这里的原始字符串，后端用 `score_rule` 做映射。

---

## 二、提交测试：POST /api/mbti/submit

### 1. 请求

- Method: `POST`
- URL: `/api/mbti/submit`
- 认证：需要登录（未登录返回 401）

#### 请求体（MBTISubmitRequest）

```json
{
  "answers": [
    {
      "question_id": 1,
      "option": "外向，通过和人交流获得能量"
    },
    {
      "question_id": 2,
      "option": "需要独处一段时间恢复精力"
    }
  ]
}
```

字段说明：

- `answers: MBTIAnswer[]`
  - `question_id: number`：题目 ID，必须与 `/questions` 返回中的 `id` 对应。
  - `option: string`：用户选择的选项文本，必须是该题 `options` 数组里的某一项。

### 2. 响应结构

外层类型：`BaseResponse<MBTIResult>`

```json
{
  "data": {
    "type": "INFJ",
    "dimension_scores": {
      "E/I": { "E": 3, "I": 10, "中立": 0 },
      "S/N": { "S": 2, "N": 11, "中立": 0 },
      "T/F": { "T": 4, "F": 9, "中立": 0 },
      "J/P": { "J": 7, "P": 2, "中立": 0 }
    },
    "report_id": "57161777-dcd5-4ed7-89d4-fe4eb06054f0",
    "created_at": "2026-03-26T08:15:30.123456"
  }
}
```

字段说明（MBTIResult）：

- `type: string`
  - 基础人格类型（四字母），等于情境算法算出来的 `base_type`。
- `dimension_scores: Record<string, Record<string, number>>`
  - 旧版维度票数统计，用于简单维度条展示：
    - key：`"E/I"`, `"S/N"`, `"T/F"`, `"J/P"`
    - value 示例：`{ "E": 3, "I": 10, "中立": 0 }`
- `report_id: string`
  - 报告唯一 ID，用于后续查询完整报告。
- `created_at: string`
  - 报告创建时间（ISO 字符串）。

> 说明：  
> 该接口只返回轻量结果，用于“提交完成页”。  
> 完整解读需要通过 `GET /api/mbti/report/{report_id}` 获取。

---

## 三、获取完整报告：GET /api/mbti/report/{report_id}

### 1. 请求

- Method: `GET`
- URL: `/api/mbti/report/{report_id}`
- Path 参数：
  - `report_id: string`：提交时返回的报告 ID。
- 认证：
  - 需要登录，且当前用户必须是该报告的 owner。

### 2. 响应结构

外层类型：`BaseResponse<MBTIReport>`

完整示例（结构示意，部分字段省略）：

```json
{
  "data": {
    "report_id": "57161777-dcd5-4ed7-89d4-fe4eb06054f0",
    "created_at": "2026-03-26T08:15:30.123456",
    "type": "INFJ",
    "dimension_scores": {
      "E/I": { "E": 3, "I": 10, "中立": 0 },
      "S/N": { "S": 2, "N": 11, "中立": 0 },
      "T/F": { "T": 4, "F": 9, "中立": 0 },
      "J/P": { "J": 7, "P": 2, "中立": 0 }
    },
    "dimensions": [
      {
        "dimension": "E/I",
        "left": { "letter": "E", "label": "外向", "percent": 20 },
        "right": { "letter": "I", "label": "内向", "percent": 80 },
        "neutral": { "count": 0, "percent_all": 0 },
        "chosen": "I",
        "clarity": "高"
      }
    ],
    "core": {
      "letters": [
        {
          "dimension": "E/I",
          "title": "能量来源：外向 vs 内向",
          "description": "描述你更倾向从外部世界还是内在世界获取能量。",
          "your_side": "I",
          "your_summary": "这次结果更偏向内向，所以你更常以這一侧的方式来应对日常情境。"
        }
      ],
      "rarity": {
        "rank_label": "偏少见",
        "population_range": "约占总人口 1–3%",
        "note": "AI 根据类型估算的一段说明。"
      },
      "strengths_growth": {
        "strengths_static": ["…", "..."],
        "weaknesses_static": ["…", "..."],
        "strengths_focus_ai": ["…", "..."],
        "growth_ai": ["…", "..."]
      },
      "self_insight": {
        "world_view": "…",
        "relationships": "…",
        "decision_style": "…",
        "under_stress": "…"
      },
      "neighbors": {
        "primary": "ENFJ",
        "reason": "…",
        "other_candidates": ["INFP", "INTJ"]
      },
      "archetype": {
        "label": "提倡者"
      }
    },
    "modules": [
      {
        "id": "core_overview",
        "title": "核心人格解读",
        "category": "basic",
        "need_pay": false,
        "unlocked": true,
        "teaser": "从整体气质、能量来源、认知方式等角度看你的基础人格。",
        "content": {
          "facets": null,
          "sections": [
            {
              "id": "core_overview_body",
              "title": "核心人格解读",
              "body": "这里是一整段围绕气质概述、能量来源、认知方式、决策风格、生活方式的综合解读。"
            }
          ],
          "summary_ai": null
        },
        "unlock_action": {
          "product_id": "",
          "cta": ""
        }
      },
      {
        "id": "context_map",
        "title": "情境图谱解读",
        "category": "basic",
        "need_pay": false,
        "unlocked": true,
        "teaser": "日常、工作、社交三种状态下，你的人格如何切换与流动。",
        "content": {
          "facets": null,
          "sections": [
            {
              "id": "context_map_daily",
              "title": "日常状态",
              "body": "这里是一段围绕你在日常状态下表现的人格解读。"
            },
            {
              "id": "context_map_work",
              "title": "工作状态",
              "body": "这里是一段围绕你在工作状态下表现的人格解读。"
            },
            {
              "id": "context_map_social",
              "title": "社交状态",
              "body": "这里是一段围绕你在社交状态下表现的人格解读。"
            },
            {
              "id": "context_map_overall",
              "title": "整体解读",
              "body": "这里是一段对你整体情境流动性的总结和比喻。"
            }
          ],
          "summary_ai": null
        },
        "unlock_action": {
          "product_id": "",
          "cta": ""
        }
      },
      {
        "id": "self_insight",
        "title": "自我认知解读",
        "category": "basic",
        "need_pay": false,
        "unlocked": true,
        "teaser": "帮助你理解\"为什么我在不同场合像变了个人\"。",
        "content": {
          "facets": null,
          "sections": [
            {
              "id": "self_insight_body",
              "title": "自我认知解读",
              "body": "这里是一整段围绕自我觉察四个主题的解读。"
            }
          ],
          "summary_ai": null
        },
        "unlock_action": {
          "product_id": "",
          "cta": ""
        }
      },
      {
        "id": "career",
        "title": "职业探索",
        "category": "basic",
        "need_pay": false,
        "unlocked": true,
        "teaser": "结合你的基础人格和工作情境人格，探索适合的职业路径。",
        "content": {
          "facets": null,
          "sections": [
            { "id": "career_work_style",       "title": "工作中的你",       "body": "…" },
            { "id": "career_fit_env",          "title": "适合的工作环境",   "body": "…" },
            { "id": "career_unfit_env",        "title": "不适合的工作环境", "body": "…" },
            { "id": "career_team_role",        "title": "团队成员角色",     "body": "…" },
            { "id": "career_leadership",       "title": "领导风格",         "body": "…" },
            { "id": "career_recommend_jobs",   "title": "职业推荐",         "body": "…" },
            { "id": "career_avoid_jobs",       "title": "职业避雷",         "body": "…" },
            { "id": "career_development_tips", "title": "职场发展建议",     "body": "…" }
          ],
          "summary_ai": null
        },
        "unlock_action": {
          "product_id": "",
          "cta": ""
        }
      },
      {
        "id": "love",
        "title": "恋爱分析",
        "category": "basic",
        "need_pay": false,
        "unlocked": true,
        "teaser": "从人格视角理解亲密关系中的你，以及更适配的相处方式。",
        "content": {
          "facets": null,
          "sections": [
            { "id": "love_in_relationship", "title": "亲密关系中的你",     "body": "…" },
            { "id": "love_expression",      "title": "你的恋爱表达方式",   "body": "…" },
            { "id": "love_state",           "title": "你的恋爱状态",       "body": "…" },
            { "id": "love_pairing",         "title": "人格配对建议",       "body": "…" }
          ],
          "summary_ai": null
        },
        "unlock_action": {
          "product_id": "",
          "cta": ""
        }
      },
      {
        "id": "strengths_growth",
        "title": "优势与成长",
        "category": "basic",
        "need_pay": false,
        "unlocked": true,
        "teaser": "盘点你的稳定优势与潜在盲点，给出具体可落地的成长建议。",
        "content": {
          "facets": null,
          "sections": [
            {
              "id": "strengths_growth_body",
              "title": "优势与成长",
              "body": "这里是一整段围绕核心优势、潜在盲点和个性化点评的解读。"
            }
          ],
          "summary_ai": null
        },
        "unlock_action": {
          "product_id": "",
          "cta": ""
        }
      },
      {
        "id": "advanced_guide",
        "title": "进阶指南",
        "category": "basic",
        "need_pay": false,
        "unlocked": true,
        "teaser": "围绕自我管理、人际沟通和职业发展，给出更进阶的行动指南。",
        "content": {
          "facets": null,
          "sections": [
            { "id": "advanced_guide_self_management", "title": "自我管理", "body": "…" },
            { "id": "advanced_guide_communication",   "title": "人际沟通", "body": "…" },
            { "id": "advanced_guide_career_growth",   "title": "职业发展", "body": "…" }
          ],
          "summary_ai": null
        },
        "unlock_action": {
          "product_id": "",
          "cta": ""
        }
      }
    ],
    "context": {
      "base_type": "INFJ",
      "context_types": {
        "work": "INTJ",
        "private": "INFP",
        "social": "ENFJ"
      },
      "dimension_scores": {
        "EI": { "general": -0.6, "work": -0.9, "private": -0.8, "social": 0.2 },
        "SN": { "general": 0.8, "work": 1.0, "private": 0.9, "social": 0.7 },
        "TF": { "general": 1.2, "work": 0.3, "private": 1.5, "social": 1.3 },
        "JP": { "general": 0.4, "work": 0.8, "private": -0.3, "social": 0.5 }
      },
      "dimension_percentages": {
        "EI": {
          "general": { "E": 20, "I": 80 },
          "work": { "E": 5, "I": 95 },
          "private": { "E": 10, "I": 90 },
          "social": { "E": 60, "I": 40 }
        }
      },
      "clarity": { "EI": "高", "SN": "高", "TF": "高", "JP": "中" },
      "context_deviation": {
        "EI": { "work": -0.3, "private": -0.2, "social": 0.8 },
        "SN": { "work": 0.2, "private": 0.1, "social": -0.1 },
        "TF": { "work": -0.9, "private": 0.3, "social": 0.1 },
        "JP": { "work": 0.4, "private": -0.7, "social": 0.1 }
      },
      "subtype": "变色龙型"
    }
  }
}
```

### 3. 字段说明

#### 3.1 顶层（MBTIReport）

- `report_id: string`：报告 ID。
- `created_at: string`：报告创建时间。
- `type: string`：基础人格类型，等于 `context.base_type`。
- `dimension_scores: Record<string, Record<string, number>>`：旧版维度票数统计（用于维度条）。
- `dimensions: MBTIDimensionResult[]`：每个维度在 bar 图上的展示信息。
- `core: MBTICore`：报告核心概览部分。
- `modules: MBTIModule[]`：进阶专题模块（八维 / 职业 / 恋爱）。
- `context: MBTIContextMetrics | null`：情境流动性相关结果（新报告有，老报告可能为空）。

#### 3.2 dimensions（MBTIDimensionResult）

- `dimension: "E/I" | "S/N" | "T/F" | "J/P"`
- `left: { letter, label, percent }`
  - `letter: "E" | "S" | "T" | "J"`
  - `label: string`：中文标签（外向 / 实感 / 思考 / 判断）
  - `percent: number`：在**有效票（不含中立）**中的百分比。
- `right: { letter, label, percent }`
  - 对应 I / N / F / P。
- `neutral: { count, percent_all }`
  - `count`：中立票数量
  - `percent_all`：中立票占总票数（含中立）的百分比。
- `chosen: string`
  - 最终选边字母。
- `clarity: "低" | "中" | "高"`
  - 基于票数差异的偏好清晰度（旧逻辑）。

#### 3.3 context（MBTIContextMetrics）——情境流动性

- `base_type: string`
  - 基础人格类型（general 场景综合类型）。
- `context_types: { work: string; private: string; social: string }`
  - 三个情境下的人格类型：
    - `work`：工作情境人格
    - `private`：私人/亲密情境人格
    - `social`：社交情境人格
- `dimension_scores: Record<"EI"|"SN"|"TF"|"JP", Record<"general"|"work"|"private"|"social", number>>`
  - 每个维度在不同情境下的平均分，范围 [-1, +1]：
    - 正数：偏向左字母（E/S/T/J）
    - 负数：偏向右字母（I/N/F/P）
- `dimension_percentages: Record<string, Record<string, Record<string, number>>>`
  - 基于 `dimension_scores` 映射的百分比表示：
    - 例如 `dimension_percentages["EI"]["general"] = { "E": 20, "I": 80 }`
- `clarity: Record<string, "低" | "中" | "高">`
  - 基于 general 场景平均分的偏好清晰度（新逻辑）。
- `context_deviation: Record<string, Record<"work"|"private"|"social", number>>`
  - 各情境相对 general 的偏差：
    - `context_deviation["EI"]["work"] = dimension_scores["EI"]["work"] - dimension_scores["EI"]["general"]`
- `subtype: string`
  - 流动性亚型：
    - `"稳定型"`：不同情境和基础人格差异很小
    - `"适应型"`：存在一定情境差异
    - `"变色龙型"`：不同情境下人格表现差异明显

#### 3.4 core（MBTICore）——核心概览

- `letters: MBTILetterIntro[]`
  - 每个维度的一小段解释：
    - `dimension`: 维度
    - `title`: 标题（如「能量来源：外向 vs 内向」）
    - `description`: 维度说明
    - `your_side`: 用户这次更偏哪一侧
    - `your_summary`: 结合结果的一小段总结
- `rarity: MBTIRarity`
  - `rank_label`: 稀有度标签（偏少见 / 中等 / 很常见）
  - `population_range`: 比例区间
  - `note`: 说明文字
- `strengths_growth: MBTIStrengthsGrowth`
  - `strengths_static`: 3–5 条稳定优势
  - `weaknesses_static`: 2–4 条常见盲点
  - `strengths_focus_ai`: 3–5 条结合本次结果的优势重点提示
  - `growth_ai`: 3–5 条结合本次结果的成长建议
- `self_insight: MBTISelfInsight`
  - `world_view`: 你如何看待自己和世界
  - `relationships`: 你在人际和沟通中的风格
  - `decision_style`: 你做选择时的习惯
  - `under_stress`: 当你累/焦虑时通常会发生什么
- `neighbors: MBTINeighbors`
  - `primary`: 最接近的近邻类型
  - `reason`: 说明
  - `other_candidates`: 其它可能混淆类型
- `archetype: MBTIArchetype`
  - `label`: 一句话人格标签（固定映射，如 `提倡者`、`建筑师`，不会随本次测试变化）

#### 3.5 modules（MBTIModule[]）——7 个 AI 模块

公共字段：

- `id: string`
  - 模块标识（固定 7 个）：
    - `"core_overview"`：核心人格解读（Prompt 1）
    - `"context_map"`：情境图谱解读（Prompt 2）
    - `"self_insight"`：自我认知解读（Prompt 3）
    - `"career"`：职业探索（Prompt 4）
    - `"love"`：恋爱分析（Prompt 5）
    - `"strengths_growth"`：优势与成长（Prompt 6）
    - `"advanced_guide"`：进阶指南（Prompt 7）
- `title: string`：模块标题。
- `category: string`：模块分类，当前统一为 `"basic"`。
- `need_pay: boolean`：是否需要付费解锁，当前统一为 `false`。
- `unlocked: boolean`：是否已解锁，当前统一为 `true`。
- `teaser: string`：模块预告文案，用于模块卡片上的一句话描述。
- `content: MBTIModuleContent`
  - `facets?: MBTIFacet[]`
    - 目前全部为 `null`（不再提供八维解读）。
  - `sections?: MBTIModuleSection[]`
    - 大部分模块只有一个 section，承载整块文案：
      - `id`: 小节 id（如 `"core_overview_body"`）
      - `title`: 小节标题（与模块 `title` 一致）
      - `body`: 对应 Prompt 生成的整段文本（可包含多段落/小标题）。
    - `context_map` 模块有 4 个 section，对应「日常状态 / 工作状态 / 社交状态 / 整体解读」。
    - `career` 模块有 8 个 section，对应「工作中的你 / 适合的工作环境 / 不适合的工作环境 / 团队成员角色 / 领导风格 / 职业推荐 / 职业避雷 / 职场发展建议」。
    - `love` 模块有 4 个 section，对应「亲密关系中的你 / 你的恋爱表达方式 / 你的恋爱状态 / 人格配对建议」。
    - `advanced_guide` 模块有 3 个 section，对应「自我管理 / 人际沟通 / 职业发展」。
  - `summary_ai?: string`
    - 目前统一为 `null`。
- `unlock_action: MBTIUnlockAction`
  - `product_id: string`：当前统一为 `""`。
  - `cta: string`：当前统一为 `""`。

---

## 四、前端接入建议简表

- 题目页：
  - 调用 `GET /api/mbti/questions`
  - 根据 `scene` 分组展示题目。
  - 记录用户选择的 `option` 文本。
- 提交页：
  - 将 `question_id` + 选中的 `option` 文本组成 `answers[]`，POST 到 `/api/mbti/submit`。
  - 取返回的 `type` / `report_id` / `created_at` 做“测试完成页”。
- 报告页：
  - 调用 `GET /api/mbti/report/{report_id}`。
  - 概览区：
    - 用 `type` + `context.subtype` 做人物卡片标题，可附加 `core.rarity` 做稀有度标签。
  - 情境图谱：
    - 用 `context.dimension_scores` / `context.dimension_percentages` / `context.context_types`。
  - 详细文案：
    - `core`：用于类型关键词、稀有度、优势/盲点等结构化信息展示。
    - `modules`：根据 `id` 渲染 7 个 AI 文案模块，例如：
      - `core_overview`：放在报告首页的「核心人格解读」卡片。
      - `context_map`：配合情境图谱使用。
      - `career` / `love` / `strengths_growth` / `advanced_guide`：分别作为职场、恋爱、成长、进阶区块。


## 测试传入hardcoe
Request URL: http://127.0.0.1:8000/api/mbti/submit
Request Method: POST
Status Code: 200 OK
Remote Address: 127.0.0.1:8000
Referrer Policy: strict-origin-when-cross-origin
content-length: 250
content-type: application/json
date: Sat, 28 Mar 2026 08:32:09 GMT
server: uvicorn
Accept: */*
Accept-Encoding: gzip, deflate, br
Accept-Language: zh-CN,zh;q=0.9
authorization: Bearer adb8ae73c8a14edfaeae62449e1151e6
Connection: keep-alive
Content-Length: 2870
content-type: application/json
Host: 127.0.0.1:8000
Referer: https://servicewechat.com/wx59ed511a81fba81c/devtools/page-frame.html
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: same-site
User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1 wechatdevtools/2.01.2602032 MicroMessenger/8.0.5 Language/zh_CN webview/ hash/1144816974 sid/fHsaXzDNDg token/67ab5aa4e7096779a5e088718029f6ef
user-timezone: Asia/Shanghai
{"answers":[{"question_id":1,"option":"内向，通过独处思考获得能量"},{"question_id":2,"option":"需要独处一段时间恢复精力"},{"question_id":3,"option":"还不想走，想再聊聊"},{"question_id":4,"option":"感到消耗，需要一个人待着"},{"question_id":5,"option":"找同事讨论，集思广益"},{"question_id":6,"option":"先听别人说，必要时再补充"},{"question_id":7,"option":"一个人安静吃饭"},{"question_id":8,"option":"写日记或自己消化"},{"question_id":9,"option":"很放松，能量恢复了"},{"question_id":10,"option":"马上找人讨论剧情"},{"question_id":11,"option":"只和熟人待在一起"},{"question_id":12,"option":"越晚越嗨"},{"question_id":13,"option":"等别人叫我，不太主动"},{"question_id":14,"option":"隐喻象征、整体氛围"},{"question_id":15,"option":"先了解整体框架，再填充细节"},{"question_id":16,"option":"具体的、实际发生的事情"},{"question_id":17,"option":"当时的感受和整体印象"},{"question_id":18,"option":"执行具体任务，把控细节"},{"question_id":19,"option":"先写灵感部分，再组织"},{"question_id":20,"option":"问清楚具体要做什么、deadline是什么时候"},{"question_id":21,"option":"人物内心动机、剧情深层含义"},{"question_id":22,"option":"喜欢有灵活调整空间"},{"question_id":23,"option":"具体描述去了哪里、吃了什么"},{"question_id":24,"option":"具体发生了什么"},{"question_id":25,"option":"今天做了什么、吃了什么"},{"question_id":26,"option":"关注TA给我的整体感觉"},{"question_id":27,"option":"帮TA分析问题、给解决方案"},{"question_id":28,"option":"批评内容对不对"},{"question_id":29,"option":"逻辑分析和客观标准"},{"question_id":30,"option":"剧情合理、逻辑严密"},{"question_id":31,"option":"结果和效率"},{"question_id":32,"option":"先肯定再委婉提建议"},{"question_id":33,"option":"据理力争，谁对谁错"},{"question_id":34,"option":"陪TA、听TA倾诉"},{"question_id":35,"option":"让步，维护关系和谐"},{"question_id":36,"option":"哪个更合理、更划算"},{"question_id":37,"option":"理性分析哪家好吃、性价比高"},{"question_id":38,"option":"希望大家别伤了和气"},{"question_id":39,"option":"避免争论，照顾大家的感受"},{"question_id":40,"option":"提前规划好行程"},{"question_id":41,"option":"最后冲刺效率更高"},{"question_id":42,"option":"希望事情能按计划来"},{"question_id":43,"option":"按清单和计划执行"},{"question_id":44,"option":"反而兴奋，喜欢这种挑战"},{"question_id":45,"option":"希望早点确定下来"},{"question_id":46,"option":"睡到自然醒再说"},{"question_id":47,"option":"想到什么买什么"},{"question_id":48,"option":"乱中有序，找得到就行"}]}