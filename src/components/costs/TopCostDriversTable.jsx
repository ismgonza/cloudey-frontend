import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Flame } from 'lucide-react';

function TopCostDriversTable({ data }) {
  const [sorting, setSorting] = useState([{ id: 'cost', desc: true }]);

  const columns = [
    {
      id: 'rank',
      header: '#',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.index < 3 && <Flame className="h-4 w-4 text-orange-500" />}
          <span className="font-semibold text-gray-600">{row.index + 1}</span>
        </div>
      ),
      size: 60,
    },
    {
      accessorKey: 'resource_name',
      header: 'Resource',
      cell: ({ getValue, row }) => (
        <div>
          <div className="font-medium text-gray-900">{getValue()}</div>
          <div className="text-xs text-gray-500">{row.original.resource_id}</div>
        </div>
      ),
    },
    {
      accessorKey: 'service',
      header: 'Service',
      cell: ({ getValue }) => (
        <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-sm">
          {getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'compartment_name',
      header: 'Compartment',
      cell: ({ getValue }) => (
        <span className="text-gray-700">{getValue()}</span>
      ),
    },
    {
      accessorKey: 'cost',
      header: 'Cost (Latest Month)',
      cell: ({ getValue, row }) => {
        const cost = getValue();
        const isTop3 = row.index < 3;
        return (
          <span className={`font-semibold ${isTop3 ? 'text-orange-600' : 'text-gray-900'}`}>
            ${cost?.toLocaleString()}
          </span>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Calculate total cost for all items
  const totalCost = data.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="space-y-4">
      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No resource data available
        </div>
      ) : (
        <>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-auto" style={{ maxHeight: '600px' }}>
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-10 bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b border-gray-200">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-gray-50"
                          style={{ width: header.getSize() }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      idx < 3 ? 'bg-orange-50/30' : ''
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3 px-4 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between border border-gray-200">
          <div className="text-sm text-gray-600">
            Top {data.length} resources represent
          </div>
          <div className="text-lg font-semibold text-gray-900">
            ${totalCost.toLocaleString()}
          </div>
        </div>
      </>
    )}
  </div>
  );
}

export default TopCostDriversTable;

