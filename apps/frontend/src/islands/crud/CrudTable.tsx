import type { ReactNode } from "react";

export interface CrudColumn<T> {
	id: string;
	header: string;
	cell: (row: T) => ReactNode;
	className?: string;
}

interface CrudTableProps<T> {
	columns: CrudColumn<T>[];
	rows: T[];
	getRowKey: (row: T) => string;
	emptyMessage: string;
	colSpan?: number;
}

export function CrudTable<T>({
	columns,
	rows,
	getRowKey,
	emptyMessage,
	colSpan = columns.length,
}: CrudTableProps<T>) {
	return (
		<div className="admin-table-wrap">
			<table>
				<thead>
					<tr>
						{columns.map((column) => (
							<th key={column.id}>{column.header}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.length === 0
						? (
							<tr className="admin-empty-row">
								<td colSpan={colSpan}>{emptyMessage}</td>
							</tr>
						)
						: rows.map((row) => (
							<tr key={getRowKey(row)}>
								{columns.map((column) => (
									<td key={column.id} className={column.className}>
										{column.cell(row)}
									</td>
								))}
							</tr>
						))}
				</tbody>
			</table>
		</div>
	);
}
