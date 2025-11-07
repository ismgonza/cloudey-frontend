import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

function CompartmentCostsTable({ data, monthNames, totals }) {
  const [expanded, setExpanded] = useState({});
  const [sorting, setSorting] = useState([]);

  const getTrendIcon = (direction) => {
    if (direction === 'up') return <TrendingUp className="h-4 w-4" />;
    if (direction === 'down') return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = (color) => {
    if (color === 'green') return 'text-green-600 bg-green-50';
    if (color === 'red') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const columns = [
    {
      id: 'expander',
      header: '',
      cell: ({ row }) => (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click from firing
            row.toggleExpanded();
          }}
          className="p-1 hover:bg-gray-100 rounded"
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          )}
        </button>
      ),
      size: 40,
    },
    {
      accessorKey: 'compartment_name',
      header: 'Compartment',
      cell: ({ getValue }) => (
        <span className="font-medium text-gray-900">{getValue()}</span>
      ),
    },
    {
      id: 'month_0',
      header: () => monthNames[0] || 'Month 1',
      accessorFn: (row) => row.months[0],
      cell: ({ getValue }) => (
        <span className="text-gray-700">${getValue()?.toLocaleString()}</span>
      ),
    },
    {
      id: 'month_1',
      header: () => monthNames[1] || 'Month 2',
      accessorFn: (row) => row.months[1],
      cell: ({ getValue }) => (
        <span className="text-gray-700">${getValue()?.toLocaleString()}</span>
      ),
    },
    {
      id: 'month_2',
      header: () => monthNames[2] || 'Month 3',
      accessorFn: (row) => row.months[2],
      cell: ({ getValue }) => (
        <span className="font-semibold text-gray-900">${getValue()?.toLocaleString()}</span>
      ),
    },
    {
      accessorKey: 'change_pct',
      header: 'MoM',
      cell: ({ row }) => {
        const { change_pct, direction, color } = row.original;
        return (
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${getTrendColor(color)}`}>
            {getTrendIcon(direction)}
            <span className="font-medium">
              {change_pct > 0 ? '+' : ''}{change_pct}%
            </span>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      expanded,
      sorting,
    },
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
  });

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
        <table className="w-full border-collapse table-fixed">
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
          {table.getRowModel().rows.map((row) => (
            <>
              {/* Main compartment row */}
              <tr
                key={row.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-3 px-4 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>

              {/* Expanded services rows */}
              {row.getIsExpanded() && row.original.services && (
                <tr key={`${row.id}-expanded`}>
                  <td colSpan={columns.length} className="bg-blue-50 p-0">
                    <div className="px-12 py-4 overflow-x-auto">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Services in {row.original.is_deleted ? row.original.compartment_id : row.original.compartment_name}
                      </h4>
                      <table className="w-full min-w-max">
                        <thead>
                          <tr className="border-b border-blue-200">
                            <th className="text-left py-2 px-4 text-xs font-medium text-gray-600">Service</th>
                            <th className="text-left py-2 px-4 text-xs font-medium text-gray-600">{monthNames[0]}</th>
                            <th className="text-left py-2 px-4 text-xs font-medium text-gray-600">{monthNames[1]}</th>
                            <th className="text-left py-2 px-4 text-xs font-medium text-gray-600">{monthNames[2]}</th>
                            <th className="text-left py-2 px-4 text-xs font-medium text-gray-600">MoM</th>
                            <th className="text-left py-2 px-4 text-xs font-medium text-gray-600">% of Comp.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {row.original.services.map((service, idx) => (
                            <tr key={idx} className="border-b border-blue-100">
                              <td className="py-2 px-4 text-sm text-gray-700">{service.service}</td>
                              <td className="py-2 px-4 text-sm text-gray-600">${service.months[0].toLocaleString()}</td>
                              <td className="py-2 px-4 text-sm text-gray-600">${service.months[1].toLocaleString()}</td>
                              <td className="py-2 px-4 text-sm font-semibold text-gray-900">${service.months[2].toLocaleString()}</td>
                              <td className="py-2 px-4">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${getTrendColor(service.color)}`}>
                                  {getTrendIcon(service.direction)}
                                  {service.change_pct > 0 ? '+' : ''}{service.change_pct}%
                                </span>
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-600">{service.pct_of_compartment}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}

          {/* Totals row */}
          {totals && (
            <tr className="sticky bottom-0 border-t-2 border-gray-300 bg-gray-50 font-semibold">
              <td className="py-3 px-4 text-sm"></td>
              <td className="py-3 px-4 text-sm text-gray-900">TOTAL</td>
              <td className="py-3 px-4 text-sm text-gray-900">${totals.months[0]?.toLocaleString()}</td>
              <td className="py-3 px-4 text-sm text-gray-900">${totals.months[1]?.toLocaleString()}</td>
              <td className="py-3 px-4 text-sm text-gray-900">${totals.months[2]?.toLocaleString()}</td>
              <td className="py-3 px-4">
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${getTrendColor(totals.color)}`}>
                  {getTrendIcon(totals.direction)}
                  <span>{totals.change_pct > 0 ? '+' : ''}{totals.change_pct}%</span>
                </div>
              </td>
            </tr>
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CompartmentCostsTable;

