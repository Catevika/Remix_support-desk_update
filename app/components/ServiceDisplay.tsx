import DeleteButton from './DeleteButton';

export default function ServiceDisplay({
	name,
	isOwner,
	canDelete = true
}: {
	name: string;
	isOwner: boolean;
	canDelete?: boolean;
}) {
	return (
		<>
			<p>{name}</p>
			{isOwner ? (
				<DeleteButton isOwner={isOwner} canDelete={canDelete} />
			) : null}
		</>
	);
}
