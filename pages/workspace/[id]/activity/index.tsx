import workspace from "@/layouts/workspace";
import { pageWithLayout } from "@/layoutTypes";
import { loginState, workspacestate } from "@/state";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import { useRecoilState } from "recoil";
import moment from "moment";
import { IconChevronRight  } from "@tabler/icons";
import Tooltip from "@/components/tooltip";
import randomText from "@/utils/randomText";
import toast, { Toaster } from 'react-hot-toast';

const Activity: pageWithLayout = () => {
	const router = useRouter();
	const { id } = router.query;

	const [login, setLogin] = useRecoilState(loginState);
	const [workspace, setWorkspace] = useRecoilState(workspacestate);
	const text = useMemo(() => randomText(login.displayname), []);
	const [activeUsers, setActiveUsers] = useState([]);
	const [inactiveUsers, setInactiveUsers] = useState([]);
	const [topStaff, setTopStaff] = useState([]);
	const [messages, setMessages] = useState(0);
	const [idleTime, setIdleTime] = useState(0);

	async function resetActivity() {
		toast.promise(
			axios.post(`/api/workspace/${id}/activity/reset`),
			{
				loading: "Resetting activity...",
				success: <b>Activity has been reset!</b>,
				error: <b>Activity was not reset due to an unknown error.</b>
			}
		);
	}

	useEffect(() => {
		async function fetchUsers() {
			return await axios.get(`/api/workspace/${id}/activity/users`);
		}

		async function fetchStats() {
			return await axios.get(`/api/workspace/${id}/activity/stats`);
		}

		function setData() {
			fetchUsers().then(({ data }) => {
				setActiveUsers(data.message.activeUsers);
				setInactiveUsers(data.message.inactiveUsers);
				setTopStaff(data.message.topStaff)
			});

			fetchStats().then(({ data }) => {
				setMessages(data.message.messages);
				setIdleTime(data.message.idle);
			});
		}

		setData();
		const interval = setInterval(setData, 10000);

		return () => clearInterval(interval);
	}, [id]);

	return <>
		<div className="pagePadding">
			<p className="text-4xl font-bold">{text}</p>

			<p className="text-3xl font-bold !mt-8 !mb-4">Activity</p>

			<div className="grid gap-2 lg:grid-cols-2 grid-rows-1 my-2">
				<div className="bg-white p-4 rounded-md">
					<p className="font-bold text-2xl leading-4 mt-1">Messages sent</p>
					<p className="mt-3 text-6xl font-extralight">{messages}</p>
				</div>
				<div className="bg-white p-4 rounded-md">
					<p className="font-bold text-2xl leading-4 mt-1">Time spent idling</p>
					<p className="mt-3 text-6xl font-extralight">{Math.round(idleTime)}m</p>
				</div>
			</div>

			<div className="bg-white p-4 rounded-md">
				<p className="font-bold text-2xl leading-4 mt-1">In-game</p>
				<p className="text-gray-500 text-xl mt-2 mb-1">Staff which are in-game</p>
				<div className="grid gap-1 grid-cols-12">
					{activeUsers.map((user: any) => (
						<Tooltip key={user.userId} tooltipText={`${user.username} (${user.userId})`} orientation="top">
							<img
								src={`https://www.roblox.com/headshot-thumbnail/image?userId=${user.userId}&width=512&height=512&format=png`}
								alt="User thumbnail"
								className="rounded-full w-10 h-10 bg-primary"
							/>
						</Tooltip>
					))}
				</div>
				{activeUsers.length === 0 && <p className="text-gray-700">No staff are in-game</p>}
			</div>

			<div className="grid gap-2 lg:grid-cols-2 grid-rows-1 mt-2">
				<div className="bg-white p-4 rounded-md">
					<p className="font-bold text-2xl leading-4 mt-1">Top staff</p>
					<p className="text-gray-500 text-xl mt-2">Leading members of the staff team in activity</p>
					<div className="flex gap-2">
						{topStaff.map((user: any) => (
							<Tooltip key={user.userId} tooltipText={`${user.username} (${user.userId}) - ${Math.floor(user.ms / 1000 / 60)} minutes`} orientation="bottom">
								<img
									src={`https://www.roblox.com/headshot-thumbnail/image?userId=${user.userId}&width=512&height=512&format=png`}
									alt="User thumbnail"
									className="rounded-full w-10 h-10 bg-primary"
								/>
							</Tooltip>
						))}
					</div>
					{topStaff.length === 0 && <p className="text-gray-700">No staff have been active yet</p>}
				</div>
				<div className="bg-white p-4 rounded-md">
					<p className="font-bold text-2xl leading-4 mt-1">Inactive right now</p>
					<p className="text-gray-500 text-xl mt-2">Staff which are not in-game</p>
					<div className="flex gap-2">
						{inactiveUsers.map((user: any) => (
							<Tooltip key={user.userId} tooltipText={`${user.username} (${user.userId}) | ${moment(user.from).format("DD MMM")} - ${moment(user.to).format("DD MMM")} for ${user.reason} `} orientation="bottom">
								<img
									src={`https://www.roblox.com/headshot-thumbnail/image?userId=${user.userId}&width=512&height=512&format=png`}
									alt="User thumbnail"
									className="rounded-full w-10 h-10 bg-primary"
								/>
							</Tooltip>
						))}
					</div>
					{inactiveUsers.length === 0 && <p className="text-gray-700">No staff are inactive right now</p>}
				</div>
			</div>

			<p className="text-3xl font-bold !mt-8 !mb-2">Manage</p>
			<div className="grid gap-y-1 gap-x-3 lg:grid-cols-2 3xl:grid-cols-4 2xl:grid-cols-3 md:grid-cols-2 grid-rows-1">
				{workspace.yourPermission.includes('manage_activity') && <div className="cardBtn" onClick={() => router.push(`/workspace/${id}/notices/pending`)}>
					<div className="flex flex-row">
						<div className="flex flex-col">
							<p className="font-bold text-2xl leading-6 mt-1">View notices</p>
							<p className="text-gray-500 text-xl mt-2">View all the pending inactivity notices</p>
						</div>


					</div>
				</div>}
				<div className="cardBtn cursor-pointer" onClick={() => router.push(`/workspace/${id}/profile/${login.userId}`)}>
					<p className="font-bold text-2xl leading-6 mt-1">View my profile</p>
					<p className="text-gray-500 text-xl mt-2">View your profile on this workspace</p>
				</div>
				<div className="cardBtn" onClick={() => router.push(`/workspace/${id}/notices`)}>
					<p className="font-bold text-2xl leading-6 mt-1">View my notices</p>
					<p className="text-gray-500 text-xl mt-2">View your pending and past notices</p>
				</div>
				{workspace.yourPermission.includes('manage_activity') && <div className="cardBtn" onClick={resetActivity}>
					<p className="font-bold text-2xl leading-6 mt-1">New timeframe</p>
					<p className="text-gray-500 text-xl mt-2">This will create a new timeframe</p>
				</div>}
				{workspace.yourPermission.includes('admin') && <div className="cardBtn" onClick={() => router.push(`/workspace/${id}/activity/quotas`)}>
					<p className="font-bold text-2xl leading-6 mt-1">Manage quotas</p>
					<p className="text-gray-500 text-xl mt-2">Manage your workspaces quotas</p>
				</div>}
			</div>

			<Toaster position="bottom-center" />
		</div>
	</>;
}

Activity.layout = workspace

export default Activity