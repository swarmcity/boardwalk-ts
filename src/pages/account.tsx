import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, ConfirmModal, IconButton, Input } from '@swarm-city/ui-library'

// Components
import { Redirect } from '../components/redirect'
import { Container } from '../ui/container'
import { getColor } from '../ui/colors'
import { Avatar } from '../ui/avatar'
import { Typography } from '../ui/typography'
import { Pencil } from '../ui/icons/pencil'
import { Arrow } from '../ui/icons/arrow'
import { CreateAvatar } from '../components/modals/create-avatar'

// Containers
import { MarketplaceReputationContainer } from '../containers/marketplace-reputation'

// Store and routes
import { useStore } from '../store'
import {
	LOGIN,
	ACCOUNT_PRIVATE_WALLET,
	ACCOUNT_BACKUP,
	MARKETPLACES,
} from '../routes'
import { useMarketplaceListSync } from './marketplaces/services/marketplace-list'

export const Account = () => {
	const [editingUsernane, setEditingUsername] = useState<boolean>(false)
	const [username, setUsername] = useState<string | undefined>()
	const [showConfirmDialog, setShowConfirmDialog] = useState(false)
	const [profile, setProfile] = useStore.profile()
	const navigate = useNavigate()
	const marketplaces = useMarketplaceListSync()

	if (!profile?.address) {
		return <Redirect to={LOGIN} />
	}

	return (
		<>
			{showConfirmDialog && (
				<ConfirmModal
					confirm={{
						onClick: () => {
							setProfile()
							navigate(MARKETPLACES)
						},
					}}
					cancel={{ onClick: () => setShowConfirmDialog(false) }}
					variant="danger"
				>
					<Typography variant="header-35" color="white">
						Do you want to remove this user from this device?
					</Typography>
					<div style={{ marginTop: 22 }}>
						<Typography variant="small-light-12" color="white">
							You will need your backup to restore this user on this device.
						</Typography>
					</div>
				</ConfirmModal>
			)}
			<div
				style={{
					width: '100vw',
					minHeight: '100vh',
					backgroundColor: getColor('grey2-lines'),
				}}
			>
				<div
					style={{
						backgroundColor: getColor('grey1'),
					}}
				>
					<Container>
						<div style={{ position: 'relative', width: '100%' }}>
							<div style={{ position: 'absolute', right: 15, top: 15 }}>
								<IconButton variant="close" onClick={() => navigate(-1)} />
							</div>
						</div>
						<main
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								marginLeft: 50,
								marginRight: 50,
								marginTop: 130,
								textAlign: 'center',
							}}
						>
							<CreateAvatar>
								<Avatar
									size={90}
									avatar={profile.avatar}
									style={{ cursor: 'pointer' }}
								/>
								<div
									style={{
										position: 'relative',
										width: '100%',
										cursor: 'pointer',
									}}
								>
									<div
										style={{
											position: 'absolute',
											right: -10,
											bottom: 0,
											backgroundColor: getColor('grey5'),
											borderRadius: '50%',
											width: 30,
											height: 30,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.25)',
											cursor: 'pointer',
										}}
									>
										<Arrow />
									</div>
								</div>
							</CreateAvatar>
							{!editingUsernane && (
								<>
									<Typography
										variant="small-bold-10"
										color="grey3"
										style={{ marginTop: 30 }}
									>
										Username
									</Typography>
									<div
										style={{
											marginTop: 10,
											display: 'flex',
											flexDirection: 'row',
											alignItems: 'center',
											justifyContent: 'center',
										}}
									>
										<Typography variant="body-bold-16" color="grey4">
											{profile.username}
										</Typography>
										<Pencil
											fill={getColor('blue')}
											size={18}
											style={{ cursor: 'pointer', marginLeft: 10 }}
											onClick={() => setEditingUsername(true)}
										/>
									</div>
								</>
							)}
							{editingUsernane && (
								<>
									<Input
										id="username"
										defaultValue={profile.username}
										autoFocus
										onChange={(e) => setUsername(e.target.value)}
									>
										Username
									</Input>
									<div
										style={{
											marginTop: 20,
											display: 'flex',
											flexDirection: 'row',
											justifyContent: 'center',
											alignItems: 'center',
										}}
									>
										<IconButton
											variant="close"
											onClick={() => setEditingUsername(false)}
											style={{ marginRight: 10 }}
										/>
										<IconButton
											variant="confirmAction"
											disabled={!username || username === profile.username}
											onClick={() => {
												setProfile({
													...profile,
													username: username!,
													lastUpdate: new Date(),
												})
												setEditingUsername(false)
											}}
										/>
									</div>
								</>
							)}
							<div
								style={{
									backgroundColor: getColor('grey2'),
									padding: 4,
									margin: 0,
									borderRadius: 10,
									marginTop: 50,
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'center',
									alignItems: 'center',
								}}
							>
								<Typography variant="small-light-10" color="grey4">
									no new notifications
								</Typography>
							</div>
							<Link
								to={ACCOUNT_PRIVATE_WALLET}
								style={{
									marginTop: 15,
								}}
							>
								<Typography
									style={{
										cursor: 'pointer',
										borderBottom: `2px dotted ${getColor('blue')}`,
									}}
									variant="small-bold-12"
									color="blue"
								>
									show my keys
								</Typography>
							</Link>
							<div
								style={{
									marginBottom: 20,
									marginTop: 30,
									textAlign: 'left',
									alignItems: 'flex-start',
									width: '100%',
								}}
							>
								{marketplaces &&
									Object.values(marketplaces).map((marketplace) => (
										<MarketplaceReputationContainer
											key={marketplace.address}
											marketplaceId={marketplace.address}
											marketplaceName={marketplace.name}
											userAddress={profile.address}
											style={{
												marginTop: 15,
											}}
										/>
									))}
							</div>
						</main>
					</Container>

					<div
						style={{
							width: '100%',
							height: 0,
							borderBottom: `1px solid ${getColor('grey2')}`,
							marginTop: 50,
							marginBottom: 50,
						}}
					/>
					<Container>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								marginLeft: 50,
								marginRight: 50,
								paddingBottom: 50,
								textAlign: 'center',
							}}
						>
							{/* FIXME: this should be rewritten to some sort of modal popup */}
							<Button size="large" onClick={() => navigate(ACCOUNT_BACKUP)}>
								backup this user
							</Button>
						</div>
					</Container>
				</div>
				<Container>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							marginTop: 40,
							marginBottom: 40,
							marginLeft: 50,
							marginRight: 50,
							textAlign: 'center',
						}}
					>
						<Button
							size="large"
							color="red"
							onClick={() => setShowConfirmDialog(true)}
						>
							remove user from device
						</Button>
					</div>
				</Container>
			</div>
		</>
	)
}
