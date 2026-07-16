<template>
	<view class="mine-page">
		<!-- Profile header -->
		<view class="mine__hero">
			<n-navbar title="我的" />
			<view class="mine__profile">
				<view class="mine__avatar">
					<image v-if="user?.avatarUrl" class="mine__avatar-img" :src="user.avatarUrl" mode="aspectFill" />
					<text v-else class="mine__avatar-placeholder">{{ avatarInitial }}</text>
				</view>
				<view class="mine__info">
					<view class="mine__name-row">
						<text class="mine__name">{{ user?.realName || user?.nickname || '未登录' }}</text>
						<view v-if="user?.role === 'ADMIN'" class="mine__badge">
							<text class="mine__badge-text">管理员</text>
						</view>
					</view>
					<text class="mine__meta">{{ user?.department || '' }} </text>
				</view>
			</view>

			<view class="mine__stats">
				<view class="mine__stat">
					<text class="mine__stat-value">{{ stats.quizCount }}</text>
					<text class="mine__stat-label">答题次数</text>
				</view>
				<view class="mine__stat-divider" />
				<view class="mine__stat">
					<text class="mine__stat-value">{{ stats.averageScore }}分</text>
					<text class="mine__stat-label">平均得分</text>
				</view>
				<view class="mine__stat-divider" />
				<view class="mine__stat">
					<text class="mine__stat-value">{{ stats.answeredCount }}/{{ stats.totalCount }}</text>
					<text class="mine__stat-label">已答题数</text>
				</view>
			</view>
		</view>

		<!-- Menu -->
		<view class="mine__menu">
			<view class="mine__menu-item" hover-class="mine__menu-item--hover" @tap="handleTraining">
				<text class="mine__menu-label">培训材料</text>
				<view class="mine__menu-right">
					<text v-if="user?.trainingConfirmed" class="mine__menu-tag mine__menu-tag--done">已完成</text>
					<text v-else class="mine__menu-tag mine__menu-tag--pending">待确认</text>
					<text class="mine__menu-arrow">&gt;</text>
				</view>
			</view>

			<view v-if="user?.role === 'ADMIN'" class="mine__menu-item" hover-class="mine__menu-item--hover"
				@tap="handleAdmin">
				<text class="mine__menu-label">数据统计</text>
				<text class="mine__menu-arrow">&gt;</text>
			</view>

			<view class="mine__menu-item" hover-class="mine__menu-item--hover" @tap="handleAbout">
				<text class="mine__menu-label">关于我们</text>
				<text class="mine__menu-arrow">&gt;</text>
			</view>
		</view>

		<!-- Logout -->
		<view class="mine__logout-section">
			<button class="mine__logout-btn" hover-class="mine__logout-btn--hover" @tap="handleLogout">
				<text class="mine__logout-text">退出登录</text>
			</button>
		</view>
	</view>
</template>

<script setup>
	import {
		computed
	} from 'vue'
	import {
		useUserStore
	} from '@/store/user'
	import {
		logout
	} from '@/api/auth'

	const userStore = useUserStore()
	const user = computed(() => userStore.user)

	const avatarInitial = computed(() => {
		const name = user.value?.realName || user.value?.nickname || '?'
		return name.charAt(0)
	})

	const stats = computed(() => ({
		quizCount: user.value?.statistics?.quizCount || 0,
		averageScore: user.value?.statistics?.averageScore || 0,
		answeredCount: user.value?.statistics?.answeredQuestionCount || 0,
		totalCount: user.value?.statistics?.totalQuestionCount || 200
	}))

	function handleTraining() {
		uni.navigateTo({
			url: '/pages/training/training'
		})
	}

	function handleAdmin() {
		uni.navigateTo({
			url: '/pages/admin/dashboard'
		})
	}

	function handleAbout() {
		uni.showModal({
			title: '星云答题',
			content: '星云大数据 · 职工AI知识答题系统\n版本 V1.0.0\n\n面向企业内部员工提供AI知识学习与考核的答题系统。',
			showCancel: false
		})
	}

	async function handleLogout() {
		const res = await uni.showModal({
			title: '退出登录',
			content: '确定要退出登录吗？'
		})
		if (res.confirm) {
			await logout()
			userStore.logout()
			uni.reLaunch({
				url: '/pages/login/login'
			})
		}
	}
</script>

<style lang="scss" scoped>
	.mine-page {
		min-height: 100vh;
		background: $bg-cool;
	}

	.mine {
		&__hero {
			background: $gradient-brand;
			padding-bottom: $spacing-6;
		}

		&__profile {
			display: flex;
			align-items: center;
			padding: $spacing-3 $spacing-4 $spacing-4;
		}

		&__avatar {
			width: 112rpx;
			height: 112rpx;
			border-radius: 50%;
			background: rgba(255, 255, 255, 0.15);
			display: flex;
			align-items: center;
			justify-content: center;
			margin-right: $spacing-3;
			flex-shrink: 0;
			border: 3rpx solid rgba(255, 255, 255, 0.2);

			&-img {
				width: 100%;
				height: 100%;
				border-radius: 50%;
			}

			&-placeholder {
				font-size: 44rpx;
				font-weight: 700;
				color: $text-inverse;
				font-family: $font-display;
			}
		}

		&__info {
			flex: 1;
			min-width: 0;
		}

		&__name-row {
			display: flex;
			align-items: center;
			margin-bottom: 6rpx;
		}

		&__name {
			font-family: $font-display;
			font-size: $text-h2;
			font-weight: 700;
			color: $text-inverse;
			letter-spacing: $tracking-heading;
			margin-right: $spacing-2;
		}

		&__badge {
			padding: 4rpx 14rpx;
			background: $brand-teal;
			border-radius: $radius-sm;

			&-text {
				font-size: $text-xs;
				color: $text-inverse;
				font-weight: 600;
			}
		}

		&__meta {
			font-size: $text-caption;
			color: rgba(255, 255, 255, 0.6);
		}

		&__stats {
			display: flex;
			align-items: center;
			margin: 0 $spacing-4;
			padding: $spacing-3 $spacing-4;
			background: rgba(255, 255, 255, 0.1);
			border-radius: $radius-lg;
		}

		&__stat {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;

			&-value {
				font-family: $font-display;
				font-size: $text-h3;
				font-weight: 700;
				color: $text-inverse;
				letter-spacing: $tracking-heading;
				margin-bottom: 4rpx;
			}

			&-label {
				font-size: $text-xs;
				color: rgba(255, 255, 255, 0.55);
			}

			&-divider {
				width: 2rpx;
				height: 48rpx;
				background: rgba(255, 255, 255, 0.15);
			}
		}

		&__menu {
			margin: $spacing-4;
			background: $surface;
			border-radius: $radius-lg;
			box-shadow: $shadow-soft;
			overflow: hidden;
		}

		&__menu-item {
			display: flex;
			align-items: center;
			padding: $spacing-4;
			border-bottom: 1rpx solid $divider-light;
			transition-property: background-color;
			transition-duration: $duration-fast;
			transition-timing-function: $ease-out;

			&:last-child {
				border-bottom: none;
			}

			&--hover {
				background: $surface-secondary;
			}
		}

		&__menu-label {
			flex: 1;
			font-size: $text-body;
			color: $text-primary;
			font-weight: 500;
		}

		&__menu-right {
			display: flex;
			align-items: center;
		}

		&__menu-tag {
			font-size: $text-xs;
			padding: 4rpx 14rpx;
			border-radius: $radius-sm;
			margin-right: $spacing-2;

			&--done {
				background: $success-light;
				color: $success;
			}

			&--pending {
				background: $warning-light;
				color: $warning;
			}
		}

		&__menu-arrow {
			font-size: 36rpx;
			color: $text-tertiary;
			font-weight: 300;
		}

		&__logout-section {
			padding: $spacing-4;
			// margin-top: $spacing-8;
		}

		&__logout-btn {
			width: 100%;
			height: 96rpx;
			background: $surface;
			border-radius: $radius-lg;
			display: flex;
			align-items: center;
			justify-content: center;
			border: 1rpx solid $divider;
			box-shadow: $shadow-soft;
			transition-property: transform, opacity;
			transition-duration: $duration-fast;
			transition-timing-function: $ease-out;

			&--hover {
				opacity: 0.85;
				transform: scale(0.98);
			}
		}

		&__logout-text {
			font-size: $text-body;
			color: $danger;
			font-weight: 500;
		}
	}
</style>