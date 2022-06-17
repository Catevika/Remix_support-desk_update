import type { Ticket } from '@prisma/client';
import DeleteButton from './DeleteButton';

// TODO: Add notes modal

export function TicketDisplay({
	ticket,
	device,
	type,
	isOwner,
	canDelete = true
}: {
	ticket: Ticket;
	device: string;
	type: string;
	isOwner: boolean;
	canDelete?: boolean;
}) {
	return (
		<>
			{ticket ? (
				<ul className='main column-list-container'>
					<li><span
						className={
							ticket.ticketStatusId
								? `status status-${type}`
								: undefined
						}
					>
						{type}
					</span></li>
					<li>Ticket Id: <span>{ticket.ticketId}</span>&nbsp;</li>
					<li>Title:&nbsp;<span>{ticket.title}</span></li>
					<li>Product:&nbsp;<span>{device}</span></li>
					<li>Description of Issue:&nbsp;<span>{ticket.description}</span></li>
					<li>Date Submitted: <span>{new Date(ticket.createdAt).toLocaleString()}</span></li>
					<li>Date Updated: <span>{new Date(ticket.updatedAt).toLocaleString()}</span></li>
					{/* {ticket.status === 'Closed' || notes.length === 0 ? null : (
						<h2>Notes</h2>
					)} */}
					{/* {ticket.status !== 'Closed' && (
					<button onClick={openModal} className='btn'>
						<FaPlus /> Add Note
					</button>
				)}
				<Modal
					isOpen={modalIsOpen}
					onRequestClose={closeModal}
					style={customStyles}
					contentLabel='Add Note'
				>
					<h2>Add Note</h2>
					<button className='btn-close' onClick={closeModal}>
						X
					</button>
					<form onSubmit={onNoteSubmit}>
						<div className='form-group'>
							<textarea
								name='noteText'
								id='noteText'
								className='form-control'
								placeholder='Note text'
								value={noteText}
								onChange={(e) => setNoteText(e.target.value)}
							></textarea>
						</div>
						<div className='form-group'>
							<button className='btn' type='submit'>
								Submit
							</button>
						</div>
					</form>
				</Modal>
				{notes.map((note) => {
					return <NoteItem key={note._id} note={note} />;
				})} */}

					<div className='btn-center'>
						{ticket.ticketStatusId /* && type !== 'Closed' */ && (
							<button
								className='btn btn-block btn-danger' /* onClick={onTicketClose} */
							>
								Close Ticket
							</button>
						)}
						{isOwner ? (
							<DeleteButton isOwner={isOwner} canDelete={canDelete} />
						) : null}
					</div>
				</ul>
			) : null}
		</>
	);
}
