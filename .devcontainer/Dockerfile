# Node 20 は 2026-04 で EOL のため、最新 LTS の 24 (Krypton) を使う。
FROM node:24-bookworm-slim

# git は W4 以降で使う。ca-certificates は https 通信に必要。
# curl は Claude Code のインストーラが使う。
# slim イメージにはどれも入っていないのでここで足す。
RUN apt-get update \
 && apt-get install -y --no-install-recommends git curl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Vercel CLI はイメージに焼いておく。
# 当日の会場 Wi-Fi で 15 人が npx の初回ダウンロードを一斉に走らせると詰まるため。
# バージョンは固定する。@latest だとビルドした日によって参加者間でズレるため。
RUN npm install -g vercel@58.5.1 && npm cache clean --force

# 永続ボリュームのマウント先をイメージ側に作っておく。
# 存在しないパスに名前付きボリュームを当てると root 所有で作られ、node ユーザーが書けなくなる。
RUN mkdir -p /home/node/.claude /home/node/.local/share/com.vercel.cli \
 && chown -R node:node /home/node/.claude /home/node/.local

# ログインシェルは /etc/profile で PATH を組み直すため、下の ENV だけでは claude が見つからなくなる。
# ここでも通しておく（ENV は非ログインシェル用、こちらはログインシェル用）。
RUN printf 'export PATH="/home/node/.local/bin:$PATH"\n' > /etc/profile.d/claude-path.sh

USER node

# Claude Code は常に最新を使う方針なので、自動更新が効く入れ方にする。
# 公式の Dev Container Feature は npm のグローバル領域（root 所有）に入れるため、
# node ユーザーからは自動更新も claude update もできず、ビルドした日のバージョンで固定される。
# ネイティブインストーラを node 自身で走らせると ~/.local 配下に入り、本人が更新できる。
RUN curl -fsSL https://claude.ai/install.sh | bash
ENV PATH="/home/node/.local/bin:${PATH}"
