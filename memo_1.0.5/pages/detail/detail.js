// detail.js

Page({
  data: {
    memo: null,
    currentPreviewIndex: 0 // 存储当前预览的图片索引
  },

  onLoad(options) {
    const memoId = options.id;
    if (memoId) {
      this.loadMemoDetail(memoId);
    } else {
      wx.navigateBack();
    }
  },

  // 加载备忘录详情
  loadMemoDetail(id) {
    const memos = wx.getStorageSync("memos") || [];
    let memo = memos.find(item => item.id === id);
    
    if (memo) {
      //补充缺失字段，确保图片路径为原图路径
      memo = {
        ...memo,
        title: memo.title || "未命名备忘录",
        content: memo.content || "",
        images: memo.images || [] // 存储的是原图本地路径，不做压缩处理
      };
      this.setData({ memo });
    } else {
      wx.showToast({ title: "备忘录不存在", icon: "none" });
      setTimeout(() => { wx.navigateBack(); }, 1000);
    }
  },

  // 图片预览（显示原图+下标+非循环滑动）
  previewImage(e) {
    const { memo } = this.data;
    const initialIndex = e.currentTarget.dataset.index; // 初始点击的图片索引
    
    // 存储初始预览索引
    this.setData({ currentPreviewIndex: initialIndex });

    // 调用微信预览图片API：传入原图路径，确保预览显示原图
    wx.previewImage({
      current: memo.images[initialIndex], // 初始显示的原图路径
      urls: memo.images, // 所有原图路径列表
      loop: false, // 关闭循环滑动
      // 监听预览切换，更新下标
      onChange: (res) => {
        this.setData({ currentPreviewIndex: res.current });
        // 实时更新下标显示
        const totalCount = memo.images.length;
        const currentCount = res.current + 1;
        wx.setNavigationBarTitle({
          title: `${currentCount}/${totalCount}`
        });
      },
      // 初始预览时显示下标
      success: () => {
        const totalCount = memo.images.length;
        const currentCount = initialIndex + 1;
        wx.setNavigationBarTitle({
          title: `${currentCount}/${totalCount}`
        });
      },
      // 预览关闭时恢复原标题
      complete: () => {
        setTimeout(() => {
          wx.setNavigationBarTitle({
            title: "备忘录详情"
          });
        }, 300);
      },
      fail: (err) => {
        wx.showToast({ title: "图片预览失败", icon: "none" });
        console.error("预览失败原因：", err);
      }
    });
  },

  // 返回列表页时恢复标题
  onUnload() {
    wx.setNavigationBarTitle({
      title: "备忘录详情"
    });
  }
});