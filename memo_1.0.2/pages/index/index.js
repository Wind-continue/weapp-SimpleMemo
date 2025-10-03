Page({
  data: {
    showInput: false,
    newContent: "",
    memos: [],
    maxInputLength: 5000
  },

  // 切换输入框显示/隐藏
  toggleInput() {
    this.setData({
      showInput: !this.data.showInput
    });
  },

  // 取消输入功能
  cancelInput() {
    this.setData({
      showInput: false,
      newContent: ""
    });
  },

  // 输入内容变化
  onInputChange(e) {
    this.setData({
      newContent: e.detail.value
    });
  },

  // 添加备忘录
  addMemo() {
    const { newContent, memos, maxInputLength } = this.data;
    if (!newContent.trim()) {
      wx.showToast({ title: "内容不能为空", icon: "none" });
      return;
    }

    // 检查输入长度，超过限制时提示
    if (newContent.length > maxInputLength) {
      wx.showToast({ 
        title: `内容不能超过${maxInputLength}个字符`, 
        icon: "none" 
      });
      return;
    }

    // 2. 解决长字符串不换行：处理连续字符（插入零宽空格）
    const processedContent = this.processLongString(newContent.trim());
    
    const createTime = this.formatTime(new Date());
    const newMemo = {
      id: Date.now().toString(),
      content: processedContent,
      createTime: createTime
    };

    this.setData({
      memos: [newMemo, ...memos],
      newContent: "",
      showInput: false
    });

    wx.setStorageSync("memos", [newMemo, ...memos]);
    wx.showToast({ title: "添加成功" });
  },

  // 处理长字符串的工具函数：在连续字符中插入零宽空格，强制换行
  processLongString(str) {
    // 匹配连续的英文字母、数字或符号（15个以上）
    const regex = /([a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{15})/g;
    // 在每15个连续字符后插入零宽空格（不会显示但会触发换行）
    return str.replace(regex, '$1\u200B');
  },

  // 删除备忘录
  deleteMemo(e) {
    const memoId = e.currentTarget.dataset.id;
    const newMemos = this.data.memos.filter(item => item.id !== memoId);
    
    this.setData({ memos: newMemos });
    wx.setStorageSync("memos", newMemos);
    wx.showToast({ title: "已删除" });
  },

  // 页面加载
  onLoad() {
    const storedMemos = wx.getStorageSync("memos") || [];
    // 处理已存储的备忘录内容，确保换行正常
    const processedMemos = storedMemos.map(memo => ({
      ...memo,
      content: this.processLongString(memo.content)
    }));
    this.setData({ memos: processedMemos });
  },

  // 时间格式化工具
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
  }
});
