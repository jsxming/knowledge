#!/bin/bash
set -euo pipefail

# 非交互式 shell (systemd/cron/ssh) 下 nvm 不会自动加载，手动加入 PATH
# 尝试 v24，不存在则用 v20
NVM_NODE_V24_BIN=$(echo /home/spotec/.nvm/versions/node/v24.*.*/bin)
if [ -d "$NVM_NODE_V24_BIN" ]; then
    export PATH="$NVM_NODE_V24_BIN:${PATH}"
    echo "使用 Node.js v24: $NVM_NODE_V24_BIN"
else
    NVM_NODE_V20_BIN=$(echo /home/spotec/.nvm/versions/node/v20.*.*/bin)
    if [ -d "$NVM_NODE_V20_BIN" ]; then
        export PATH="$NVM_NODE_V20_BIN:${PATH}"
        echo "使用 Node.js v20: $NVM_NODE_V20_BIN"
    else
        echo "警告: 未找到 v24 或 v20，PATH 未设置"
    fi
fi

#export PATH="/home/ec_user/.nvm/versions/node/v20.19.2/bin:${PATH}"

# 复制code到指定文件夹
echo 'Copy code...'
# mkdir -p /data/fee/code_source /data/fee/application

# 定义变量
# 编译code到文件夹
COMPILE_FOLDER="/data/fee/code_source"
# 运行目录
RUNNING_FOLDER="/data/fee/application"

# 获取参数
# -p 指定jar名称,比如-p admin 默认值nothing,nothing无法完成脚本执行
# -t 指定框架类型umi或者next
while getopts "p:" opt; do
  case $opt in
    p)
      PACKAGE=$OPTARG
      ;;
    ?)
      echo "Unknown parameter"
      exit 1
      ;;
  esac
done

# 名称校验
if [[ -z "${PACKAGE}" ]]; then
  echo "请使用 -p 指定项目名称tmd-pc-web、tmd-ops、tmd-mobile-web、ec-website、au-ec-website nz-ec-website"
  exit 1
fi

case "${PACKAGE}" in
  tmd-pc-web | tmd-mobile-web | tmd-ops | ec-website | au-ec-website | nz-ec-website) ;; # 什么也不做，继续执行
  *)
    echo "错误：-p 参数必须是 tmd-pc-web, tmd-ops,  tmd-mobile-web, ec-website、au-ec-website, nz-ec-website"
    exit 1
    ;;
esac

mkdir -p "${RUNNING_FOLDER}/${PACKAGE}"

# 从编译的目录拷贝到运行的目录
now=$(date +'%Y-%m-%d_%H-%M-%S')
NEXT_VERSION_NAME="${PACKAGE}-${now}"

# 日志配置：只保留最近一次发布的日志（每次执行覆盖写入）
LOG_DIR="${RUNNING_FOLDER}/${PACKAGE}/logs"
mkdir -p "${LOG_DIR}"
LOG_FILE="${LOG_DIR}/deploy.log"
exec > >(tee "${LOG_FILE}") 2>&1

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

trap 'log "部署失败: 退出码=$? 行号=${LINENO}"' ERR

log "==================================================="
log "开始部署 PACKAGE=${PACKAGE}"
log "版本名称 NEXT_VERSION_NAME=${NEXT_VERSION_NAME}"
log "日志文件 LOG_FILE=${LOG_FILE}"
log "==================================================="

log "[1/7] 拷贝编译产物: ${COMPILE_FOLDER}/${PACKAGE}.tar.gz -> ${RUNNING_FOLDER}/${PACKAGE}/${NEXT_VERSION_NAME}.tar.gz"
cp "${COMPILE_FOLDER}/${PACKAGE}.tar.gz" "${RUNNING_FOLDER}/${PACKAGE}/${NEXT_VERSION_NAME}.tar.gz"
log "拷贝完成, 大小: $(du -h "${RUNNING_FOLDER}/${PACKAGE}/${NEXT_VERSION_NAME}.tar.gz" | awk '{print $1}')"

cd "${RUNNING_FOLDER}/${PACKAGE}"

log "[2/7] 创建目录 ${NEXT_VERSION_NAME} / current_site_1 / current_site_2"
mkdir -p "${NEXT_VERSION_NAME}" current_site_1 current_site_2

log "[3/7] 解压 ${NEXT_VERSION_NAME}.tar.gz -> ${NEXT_VERSION_NAME}/"
log "MD5: $(md5sum "${NEXT_VERSION_NAME}.tar.gz")"
tar -xf "${NEXT_VERSION_NAME}.tar.gz" -C "${NEXT_VERSION_NAME}"
EXTRACTED_COUNT=$(find "${NEXT_VERSION_NAME}" -mindepth 1 | wc -l | tr -d ' ')
log "解压完成, 共 ${EXTRACTED_COUNT} 个文件/目录"
if [ "${EXTRACTED_COUNT}" -eq 0 ]; then
  log "解压后目录为空, 检查 ${PACKAGE}.tar.gz 是否损坏"
  exit 1
fi

log "[4/7] 拷贝到 current_site_1"
cp -r "${NEXT_VERSION_NAME}"/* current_site_1
log "current_site_1 拷贝完成"

cd "${RUNNING_FOLDER}/${PACKAGE}/current_site_1"

log "[5/7] yarn install (current_site_1)"
yarn install
log "yarn install 完成"

# 根据 PACKAGE 执行不同的 yarn 命令
log "[6/7] 执行发布命令 (current_site_1)"
case "${PACKAGE}" in
  nz-ec-website)
    log "运行: yarn deploy:site-nz"
    yarn deploy:site-nz
    ;;
  au-ec-website)
    log "运行: yarn deploy:site-au"
    yarn deploy:site-au
    ;;
  *)
    log "运行: yarn deploy:site1"
    yarn deploy:site1
    ;;
esac
log "current_site_1 发布完成"

case "${PACKAGE}" in
  tmd-pc-web)
    log "[6.5/7] tmd-pc-web 双站点: 更新 current_site_2"
    cd "${RUNNING_FOLDER}/${PACKAGE}"
    cp -r "${NEXT_VERSION_NAME}"/* current_site_2
    cd "${RUNNING_FOLDER}/${PACKAGE}/current_site_2"
    log "yarn install (current_site_2)"
    yarn install
    log "运行: yarn deploy:site2"
    yarn deploy:site2
    log "current_site_2 发布完成"
    ;;
  *) ;;
esac

# rsync -az --delete ${NEXT_VERSION_NAME}/ current_site_2/

cd "${RUNNING_FOLDER}/${PACKAGE}"

log "[7/7] 清理"
rm -f "${NEXT_VERSION_NAME}.tar.gz"
log "删除压缩包 ${NEXT_VERSION_NAME}.tar.gz"

# 删除旧版本目录，保留最近两个版本（本次 + 上一次）
TOTAL=$(find . -maxdepth 1 -type d -name "${PACKAGE}-*" | wc -l)
if [ "${TOTAL}" -gt 2 ]; then
  log "版本目录共 ${TOTAL} 个, 保留最近 2 个, 清理旧版本"
  find . -maxdepth 1 -type d -name "${PACKAGE}-*" | sort | head -n $((TOTAL - 2)) | tee -a "${LOG_FILE}" | xargs rm -rf
else
  log "版本目录共 ${TOTAL} 个, 无需清理"
fi

log "==================================================="
log "部署完成 ${NEXT_VERSION_NAME}"
log "==================================================="