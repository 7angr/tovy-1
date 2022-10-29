// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchworkspace, getConfig, setConfig } from '@/utils/configEngine'
import prisma, { user }from '@/utils/database';
import { withSessionRoute } from '@/lib/withSession'
import { getUsername, getThumbnail, getDisplayName } from '@/utils/userinfoEngine'
import * as noblox from 'noblox.js'
type Data = {
	success: boolean
	error?: string
	user?: any
}

export default withSessionRoute(handler);

export async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
	const userid = await noblox.getIdFromUsername(req.body.username).catch(() => null);
	if (!userid) return res.status(400).json({ success: false, error: 'Invalid username' });

	
	let user = await prisma.user.findUnique({
		where: {
			userid: userid
		},
		include: {
			roles: {
				where: {
					workspaceGroupId: parseInt(req.query.id as string)
				}
			}
		}
	});
	if (user?.roles.length) return res.status(404).json({ success: false, error: 'User not found' });
	const role = await prisma.role.findFirst({
		where: {
			isOwnerRole: false,
		}
	});
	if (!role) return res.status(404).json({ success: false, error: 'Role not found' });

	await prisma.user.update({
		where: {
			userid: userid
		},
		data: {
			roles: {
				connect: {
					id: role.id
				}
			}
		}
	});
	const newuser = {
		...user,
		roles: [
			role
		],
		username: req.body.username,
		displayName: await getDisplayName(userid),
		thumbnail: await getThumbnail(userid)
	}


	


	res.status(200).json({ success: true, user: newuser })
}