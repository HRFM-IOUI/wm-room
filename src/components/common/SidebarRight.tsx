import React, { useState, ChangeEvent } from "react";

// カテゴリとタグの選択肢（重複を削除・整理済）
const categories: string[] = ["AV", "Vlog", "Tutorial", "その他"];
const tags: string[] = [
  "女子高生", "合法jk", "jk", "幼児体型", "幼児服", "ロリ", "未○年", "素人",
  "ハメ撮り", "個人撮影", "色白", "細身", "巨乳", "パイパン", "ガキ", "メスガキ",
  "お仕置き", "レイプ", "中出し", "コスプレ", "制服", "学生", "華奢", "孕ませ",
  "スレンダー", "無料", "VR"
];

// Props型定義
type SidebarRightProps = {
  onTagSelect?: (tag: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
};

const SidebarRight: React.FC<SidebarRightProps> = ({
  onTagSelect,
  selectedCategory,
  setSelectedCategory,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>("");

  const handleTagChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedTag(val);
    if (onTagSelect) onTagSelect(val);
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCategory(val);
  };

  return (
    <div className="space-y-6">
      {/* カテゴリ選択 */}
      <div>
        <label className="block font-semibold mb-1 text-gray-700">カテゴリ 📁</label>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="w-full border p-2 rounded"
        >
          <option value="">すべて表示</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* タグ選択 */}
      <div>
        <label className="block font-semibold mb-1 text-gray-700">タグ検索 🎯</label>
        <select
          value={selectedTag}
          onChange={handleTagChange}
          className="w-full border p-2 rounded"
        >
          <option value="">すべて表示</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              #{tag}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SidebarRight;

