# ImgBed Workflow

以后这个博客的图片流程固定如下：

1. 在 `src/content` 里写文章 / 放图片
2. 运行图片同步脚本，把本地图片上传到图床
3. 脚本自动把 Markdown 里的本地图片引用替换成图床链接
4. 构建检查没问题后，直接 `git add` / `git commit` / `git push`
5. GitHub Actions 自动部署

## 命令

```bash
cd /root/yoroziya
IMG_BED_AUTH_CODE=你的authCode pnpm sync:content-images
pnpm build
git add .
git commit -m "sync content images"
git push
```

## 脚本处理范围

- `src/content/**/*.md`
- `src/content/**/*.mdx`
- frontmatter 里的 `image:`
- Markdown 正文里的 `![alt](./local-image.png)`

## 约定

- `src/content` 下的图片默认都应上传图床
- 替换完成后，文章应使用 `https://img.102465.xyz/...` 形式的链接
- 本地图片可以暂时保留，确认无误后再决定是否清理

## 注意

- 当前图床 WebDAV 是关闭的，所以脚本走的是 `/upload` 接口
- 鉴权使用 `authCode` 请求头
- 默认图床地址：`https://img.102465.xyz`
