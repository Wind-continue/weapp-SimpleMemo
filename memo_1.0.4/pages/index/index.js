// index.json

Page({
  data: {
    showInput: false,
    newTitle: "",
    newContent: "",
    memos: [],
    maxTitleLength: 50,
    maxInputLength: 5000
  },

  toggleInput() {
    if (!this.data.showInput) {
      this.setData({ newTitle: "", newContent: "" });
    }
    this.setData({ showInput: !this.data.showInput });
  },

  onTitleChange(e) {
    this.setData({ newTitle: e.detail.value });
  },

  onInputChange(e) {
    this.setData({ newContent: e.detail.value });
  },

  addMemo() {
    const { newTitle, newContent, memos, maxTitleLength, maxInputLength } = this.data;
    const trimmedTitle = newTitle.trim();
    
    // 标题校验
    if (!trimmedTitle) {
      wx.showToast({ title: "标题不能为空", icon: "none" });
      return;
    }
    if (trimmedTitle.length > maxTitleLength) {
      wx.showToast({ 
        title: `标题不能超过${maxTitleLength}个字符`, 
        icon: "none" 
      });
      return;
    }

    // 内容校验（可选）
    const trimmedContent = newContent.trim();
    if (trimmedContent.length > maxInputLength) {
      wx.showToast({ 
        title: `内容不能超过${maxInputLength}个字符`, 
        icon: "none" 
      });
      return;
    }

    // 修复：存储原始内容，同时存储处理后的内容（分别用于列表和详情）
    const createTime = this.formatTime(new Date());
    const newMemo = {
      id: Date.now().toString(),
      title: trimmedTitle,
      content: trimmedContent, // 存储原始内容（用于详情页）
      processedContent: this.processLongString(trimmedContent), // 处理后内容（用于列表页）
      createTime: createTime
    };

    this.setData({
      memos: [newMemo, ...memos],
      newTitle: "",
      newContent: "",
      showInput: false
    });

    wx.setStorageSync("memos", [newMemo, ...memos]);
    wx.showToast({ title: "添加成功" });
  },

  // 长文本处理逻辑保持不变（仅用于列表页）
  processLongString(str) {
    const regex = /([a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{15})/g;
    return str.replace(regex, '$1\u200B');
  },

  deleteMemo(e) {
    const memoId = e.currentTarget.dataset.id;
    const newMemos = this.data.memos.filter(item => item.id !== memoId);
    
    this.setData({ memos: newMemos });
    wx.setStorageSync("memos", newMemos);
    wx.showToast({ title: "已删除" });
  },

  goToDetail(e) {
    const memoId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${memoId}`
    });
  },

  // 修复：页面加载时区分原始内容和处理后内容
  onLoad() {
    const storedMemos = wx.getStorageSync("memos") || [];
    const processedMemos = storedMemos.map(memo => ({
      ...memo,
      title: memo.title || "未命名备忘录",
      // 兼容旧数据：无processedContent时自动生成
      processedContent: memo.processedContent || this.processLongString(memo.content || "")
    }));
    this.setData({ memos: processedMemos });
  },

  formatTime(date) {
    const year = date.getFullYear();
    const month = this.padZero(date.getMonth() + 1);
    const day = this.padZero(date.getDate());
    const hour = this.padZero(date.getHours());
    const minute = this.padZero(date.getMinutes());

    return `${year}-${month}-${day} ${hour}:${minute}`;
  },
  
  padZero(n) {
    return n < 10 ? `0${n}` : n;
  },

  cancelInput() {
    this.setData({
      showInput: false,
      newTitle: "",
      newContent: ""
    });
  }
});
    