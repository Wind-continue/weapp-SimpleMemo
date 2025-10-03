// detail.js

Page({
  data: {
    memo: null
  },

  onLoad(options) {
    const memoId = options.id;
    if (memoId) {
      this.loadMemoDetail(memoId);
    } else {
      wx.navigateBack();
    }
  },

  // 加载备忘录详情：兼容无标题的旧数据
  loadMemoDetail(id) {
    const memos = wx.getStorageSync("memos") || [];
    let memo = memos.find(item => item.id === id);
    
    if (memo) {
      // 兼容旧数据：无标题时显示默认标题
      memo = {
        ...memo,
        title: memo.title || "未命名备忘录",
        content: memo.content || ""
      };
      this.setData({ memo });
    } else {
      wx.showToast({ title: "备忘录不存在", icon: "none" });
      setTimeout(() => { wx.navigateBack(); }, 1000);
    }
  },

  // 返回列表页（点击导航栏返回按钮时触发）
  onUnload() {
    // 无需额外处理，导航栏返回按钮默认触发wx.navigateBack()
  }
});