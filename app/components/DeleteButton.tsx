import { Form } from '@remix-run/react';

export default function DeleteButton({
	isOwner,
	canDelete = true
}: {
	isOwner: boolean;
	canDelete?: boolean;
}) {
	return (
		<>
			{isOwner ? (
				<Form method='post' >
					<input type='hidden' name='_method' value='delete' />
					<button
						type='submit'
						className='btn form-btn btn-danger '
						disabled={!canDelete}
					>
						Delete
					</button>
				</Form>
			) : null}
		</>
	);
}
