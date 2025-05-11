// src/components/common/SidebarRight.js
import React, { useState } from "react";

const tags = [
  "女子高生",
  "合法jk",
  "jk",
  "幼児体型",
  "幼児服",
  "ロリ",
  "未○年",
  "素人",
  "ハメ撮り",
  "個人撮影",
  "色白",
  "細身",
  "巨乳",
  "パイパン",
  "ガキ",
  "メスガキ",
  "お仕置き",
  "レイプ",
  "中出し",
  "コスプレ",
  "制服",
  "学生",
  "華奢",
  "孕ませ",
];

const SidebarRight = ({ onTagSelect }) => {
  const [selected, setSelected] = useState("");

  const handleChange = (e) => {
    const val = e.target.value;
    setSelected(val);
    if (onTagSelect) onTagSelect(val);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="tagSelect" className="block font-semibold mb-2 text-gray-700">
          タグ検索 🎯
        </label>
        <select
          id="tagSelect"
          value={selected}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="">選択してください</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SidebarRight;