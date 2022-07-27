import Dialog from '@reach/dialog';
import type {
	LoaderFunction,
	ActionFunction,
	LinksFunction
} from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import {
	Form,
	useLoaderData,
	useActionData,
	useNavigate,
	useTransition
} from '@remix-run/react';
import styles from '@reach/dialog/styles.css';

import stylesUrl from '~/styles/dialog.css';
import { validateText } from '~/utils/functions';
import { deleteNote, getNoteByNoteId } from '~/models/notes.server';
import { prisma } from '~/utils/db.server';

export let links: LinksFunction = () => {
	return [
		{
			rel: 'stylesheet',
			href: styles
		},
		{
			rel: 'stylesheet',
			href: stylesUrl
		}
	];
};

type LoaderData = {
	note: Awaited<ReturnType<typeof getNoteByNoteId>>;
};

export const loader: LoaderFunction = async ({ params }) => {
	if (!params.noteId) {
		throw new Response('Note Not Found.', {
			status: 404
		});
	}

	const note = await getNoteByNoteId(params.noteId);
	if (!note) {
		throw new Response('Note Not Found.', {
			status: 404
		});
	}

	const data: LoaderData = {
		note
	};

	return data;
};

type ActionData = {
	formError?: string;
	fieldErrors?: {
		text: string | undefined;
	};
	fields?: {
		text: string;
	};
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request, params }) => {
	const form = await request.formData();
	const text = form.get('text');
	const intent = form.get('intent');

	const noteId = params.noteId;

	if (typeof text !== 'string' || !text) {
		return badRequest({
			formError: 'Invalid form data'
		});
	}

	const fieldErrors = {
		text: validateText(text)
	};

	const fields = { text };
	if (Object.values(fieldErrors).some(Boolean)) {
		return { fieldErrors, fields };
	}

	const note = await prisma.note.findUnique({ where: { noteId } });

	if (!note) {
		throw new Response('Note Not Found.', {
			status: 404
		});
	}

	if (intent === 'update') {
		await prisma.note.update({
			data: {
				noteUserId: note.noteUserId,
				noteTicketId: note.noteTicketId,
				text
			},
			where: { noteId: params.noteId }
		});
		return redirect('/board/admin/users/notelist');
	} else {
		await deleteNote(noteId);
		return redirect('/board/admin/users/notelist');
	}
};

export default function userNoteViewRoute() {
	const { note } = useLoaderData() as LoaderData;
	const navigate = useNavigate();
	const actionData = useActionData() as ActionData;
	const transition = useTransition();

	const isUpdating = Boolean(
		transition.submission?.formData.get('intent') === 'update'
	);
	const isDeleting = Boolean(
		transition.submission?.formData.get('intent') === 'delete'
	);

	function onDismiss() {
		navigate('/board/admin/users/notelist');
	}

	return (
		<Dialog
			className='dialog'
			isOpen={true}
			aria-label='Manage note'
			onDismiss={onDismiss}
		>
			<p>Note:</p>
			<Form
				className='form'
				method='post'
				reloadDocument
				key={note?.noteId ?? null}
			>
				<div className='form-group'>
					<label className='label' htmlFor='text'>
						Text:
						<textarea
							id='text'
							name='text'
							defaultValue={note?.text}
							aria-invalid={Boolean(actionData?.fieldErrors?.text)}
							aria-errormessage={
								actionData?.fieldErrors?.text ? 'text-error' : undefined
							}
							className='form-textarea'
						/>
					</label>
					{actionData?.fieldErrors?.text ? (
						<p className='error-danger' role='alert' id='name-error'>
							{actionData.fieldErrors.text}
						</p>
					) : null}
				</div>
				<div className='inline actions'>
					<button
						type='submit'
						name='intent'
						value='update'
						className='btn form-btn'
						disabled={isUpdating}
					>
						{isUpdating ? 'Updating...' : 'Update'}
					</button>
					<button type='button' className='btn form-btn' onClick={onDismiss}>
						Back to Notes
					</button>
					<button
						type='submit'
						name='intent'
						value='delete'
						className='btn form-btn btn-danger'
						disabled={isDeleting}
					>
						{isDeleting ? 'isDeleting...' : 'Delete'}
					</button>
				</div>
			</Form>
		</Dialog>
	);
}
